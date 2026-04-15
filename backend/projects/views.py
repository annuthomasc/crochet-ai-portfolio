from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Project
from .serializers import ProjectSerializer, ProjectListSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for crochet projects.
    - Public users can view public projects (read only)
    - Authenticated owner can create, edit, delete their own
    """
    queryset         = Project.objects.filter(is_public=True)
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends  = [filters.SearchFilter, filters.OrderingFilter]
    search_fields    = ['title', 'description', 'yarn_brand']
    ordering_fields  = ['created_at', 'title', 'category']

    def get_serializer_class(self):
        if self.action == 'list':
            return ProjectListSerializer
        return ProjectSerializer

    def get_queryset(self):
        queryset = Project.objects.all()
        # Public users only see public projects
        if not self.request.user.is_authenticated:
            return queryset.filter(is_public=True)
        # Authenticated owner sees all their own projects
        return queryset.filter(owner=self.request.user) | queryset.filter(is_public=True)

    def perform_create(self, serializer):
        # Automatically set the owner to the logged-in user
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_projects(self, request):
        """Returns only the logged-in user's projects — including private ones."""
        projects = Project.objects.filter(owner=request.user)
        serializer = ProjectListSerializer(projects, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Returns projects grouped by category."""
        category = request.query_params.get('category', None)
        if category:
            projects = self.get_queryset().filter(category=category)
            serializer = ProjectListSerializer(projects, many=True)
            return Response(serializer.data)
        return Response({'error': 'category parameter required'}, status=400)