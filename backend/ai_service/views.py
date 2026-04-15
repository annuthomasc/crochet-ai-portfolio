from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from projects.models import Project
from patterns.models import Pattern, ColourPalette
from .services import (
    generate_pattern_from_project,
    generate_colour_suggestions,
    detect_stitches,
)


class GeneratePatternView(APIView):
    """
    POST /api/ai/generate-pattern/
    Triggers Claude to analyze a project photo and generate a pattern.
    Why APIView instead of ViewSet? This is an action, not a resource.
    It does one specific job — generate a pattern — so APIView is cleaner.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        project_id = request.data.get('project_id')

        if not project_id:
            return Response(
                {'error': 'project_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Ensure the project belongs to the requesting user
        # Why? Security — users should only generate patterns for their own projects
        try:
            project = Project.objects.get(id=project_id, owner=request.user)
        except Project.DoesNotExist:
            return Response(
                {'error': 'Project not found or access denied'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if pattern already exists
        if hasattr(project, 'pattern'):
            return Response(
                {'error': 'Pattern already exists for this project. Use update instead.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Call the AI service
        result = generate_pattern_from_project(project)

        if not result['success']:
            return Response(
                {'error': result['error']},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Save the generated pattern to the database
        data = result['data']
        pattern = Pattern.objects.create(
            project        = project,
            created_by     = request.user,
            title          = data.get('title', f"Pattern for {project.title}"),
            description    = data.get('description', ''),
            difficulty     = data.get('difficulty', project.difficulty),
            yarn_weight    = data.get('yarn_weight', project.yarn_weight),
            hook_size      = data.get('hook_size', project.hook_size),
            gauge          = data.get('gauge', ''),
            yarn_amount    = data.get('yarn_amount', ''),
            finished_size  = data.get('finished_size', ''),
            sizes_available = data.get('sizes_available', []),
            materials_list = data.get('materials_list', []),
            abbreviations  = data.get('abbreviations', {}),
            instructions   = data.get('instructions', ''),
            notes          = data.get('notes', ''),
            chart_data     = data.get('chart_data', {}),
            ai_generated   = True,
            ai_model_used  = result['model'],
            ai_prompt_used = result['prompt'],
            ai_confidence  = data.get('ai_confidence', None),
            status         = 'draft',  # requires review before publishing
        )

        # Mark the project as having a pattern
        project.has_pattern = True
        project.save(update_fields=['has_pattern'])

        return Response({
            'success': True,
            'pattern_id': pattern.id,
            'message':    'Pattern generated successfully. Review and publish when ready.',
            'pattern': {
                'id':           pattern.id,
                'title':        pattern.title,
                'difficulty':   pattern.difficulty,
                'status':       pattern.status,
                'ai_confidence': pattern.ai_confidence,
            }
        }, status=status.HTTP_201_CREATED)


class GenerateColourSuggestionsView(APIView):
    """
    POST /api/ai/colour-suggestions/
    Generates yarn colour palette suggestions for an existing pattern.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        pattern_id = request.data.get('pattern_id')
        mood       = request.data.get('mood', None)

        if not pattern_id:
            return Response(
                {'error': 'pattern_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            pattern = Pattern.objects.get(id=pattern_id, created_by=request.user)
        except Pattern.DoesNotExist:
            return Response(
                {'error': 'Pattern not found or access denied'},
                status=status.HTTP_404_NOT_FOUND
            )

        result = generate_colour_suggestions(pattern.project, pattern, mood)

        if not result['success']:
            return Response(
                {'error': result['error']},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Save each palette to the database
        saved_palettes = []
        for palette_data in result['data'].get('palettes', []):
            palette = ColourPalette.objects.create(
                pattern     = pattern,
                name        = palette_data.get('name', 'Untitled Palette'),
                mood        = palette_data.get('mood', 'neutral'),
                colors      = palette_data.get('colors', []),
                color_names = palette_data.get('color_names', []),
                ai_generated = True,
            )
            saved_palettes.append({
                'id':          palette.id,
                'name':        palette.name,
                'mood':        palette.mood,
                'colors':      palette.colors,
                'color_names': palette.color_names,
            })

        return Response({
            'success':  True,
            'palettes': saved_palettes,
            'message':  f'{len(saved_palettes)} colour palettes generated'
        }, status=status.HTTP_201_CREATED)


class DetectStitchesView(APIView):
    """
    POST /api/ai/detect-stitches/
    Analyzes a project photo and identifies crochet stitches.
    Public endpoint — adds educational value to the portfolio.
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def post(self, request):
        project_id = request.data.get('project_id')

        if not project_id:
            return Response(
                {'error': 'project_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            project = Project.objects.get(id=project_id, is_public=True)
        except Project.DoesNotExist:
            return Response(
                {'error': 'Project not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        result = detect_stitches(project)

        if not result['success']:
            return Response(
                {'error': result['error']},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response({
            'success':       True,
            'project_title': project.title,
            'analysis':      result['data']
        })


class AIHealthCheckView(APIView):
    """
    GET /api/ai/health/
    Checks that the Claude API connection is working.
    Why? Useful for debugging in production — you can ping this
    endpoint to confirm the AI service is alive without running
    a full pattern generation.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            from django.conf import settings
            import anthropic
            client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            response = client.messages.create(
                model      = "claude-sonnet-4-20250514",
                max_tokens = 10,
                messages   = [{"role": "user", "content": "Reply with OK only"}]
            )
            return Response({
                'status':  'healthy',
                'message': 'Claude API connection successful',
                'model':   'claude-sonnet-4-20250514'
            })
        except Exception as e:
            return Response({
                'status':  'unhealthy',
                'message': str(e)
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)