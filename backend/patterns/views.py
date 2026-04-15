from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Pattern, ColourPalette
from .serializers import (
    PatternListSerializer,
    PatternDetailSerializer,
    ColourPaletteSerializer,
)


class PatternViewSet(viewsets.ModelViewSet):
    """
    Handles browsing, viewing, and managing crochet patterns.
    - Anyone can browse published patterns
    - Only authenticated owner can edit/delete
    """
    queryset           = Pattern.objects.filter(status='published')
    serializer_class   = PatternDetailSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ['title', 'description', 'instructions', 'yarn_weight']
    ordering_fields    = ['created_at', 'view_count', 'download_count', 'difficulty']

    def get_serializer_class(self):
        if self.action == 'list':
            return PatternListSerializer
        return PatternDetailSerializer

    def get_queryset(self):
        queryset = Pattern.objects.all()
        if not self.request.user.is_authenticated:
            return queryset.filter(status='published')
        # Owner sees all their own patterns including drafts
        return queryset.filter(created_by=self.request.user) | queryset.filter(status='published')

    def retrieve(self, request, *args, **kwargs):
        """Increment view count every time a pattern is viewed."""
        instance = self.get_object()
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def increment_download(self, request, pk=None):
        """Called by frontend when user downloads the pattern."""
        pattern = self.get_object()
        pattern.download_count += 1
        pattern.save(update_fields=['download_count'])
        return Response({'download_count': pattern.download_count})

    @action(detail=True, methods=['get'])
    def colour_palettes(self, request, pk=None):
        """Returns all colour palettes for a specific pattern."""
        pattern  = self.get_object()
        palettes = pattern.colour_palettes.all()
        serializer = ColourPaletteSerializer(palettes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_difficulty(self, request):
        """Filter patterns by difficulty level."""
        difficulty = request.query_params.get('difficulty', None)
        if difficulty:
            patterns = self.get_queryset().filter(difficulty=difficulty)
            serializer = PatternListSerializer(patterns, many=True)
            return Response(serializer.data)
        return Response({'error': 'difficulty parameter required'}, status=400)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_patterns(self, request):
        """Returns all patterns belonging to the logged-in user."""
        patterns = Pattern.objects.filter(created_by=request.user)
        serializer = PatternListSerializer(patterns, many=True)
        return Response(serializer.data)