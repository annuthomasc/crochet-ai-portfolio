from rest_framework import serializers
from .models import Pattern, ColourPalette
from projects.serializers import ProjectListSerializer


class ColourPaletteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ColourPalette
        fields = [
            'id',
            'name',
            'mood',
            'colors',
            'color_names',
            'ai_generated',
            'created_at',
        ]


class PatternListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for browsing patterns."""
    project_title    = serializers.ReadOnlyField(source='project.title')
    project_category = serializers.ReadOnlyField(source='project.category')
    project_image    = serializers.SerializerMethodField()

    class Meta:
        model  = Pattern
        fields = [
            'id',
            'title',
            'difficulty',
            'status',
            'yarn_weight',
            'hook_size',
            'finished_size',
            'ai_generated',
            'view_count',
            'download_count',
            'project_title',
            'project_category',
            'project_image',
            'created_at',
        ]

    def get_project_image(self, obj):
        if obj.project.image:
            return obj.project.image.url
        return None


class PatternDetailSerializer(serializers.ModelSerializer):
    """Full serializer for viewing a single pattern."""
    project         = ProjectListSerializer(read_only=True)
    colour_palettes = ColourPaletteSerializer(many=True, read_only=True)
    created_by_username = serializers.ReadOnlyField(source='created_by.username')

    class Meta:
        model  = Pattern
        fields = [
            'id',
            'title',
            'description',
            'difficulty',
            'status',
            'yarn_weight',
            'hook_size',
            'gauge',
            'yarn_amount',
            'abbreviations',
            'materials_list',
            'instructions',
            'notes',
            'sizes_available',
            'finished_size',
            'chart_data',
            'ai_generated',
            'ai_model_used',
            'ai_confidence',
            'view_count',
            'download_count',
            'colour_palettes',
            'project',
            'created_by_username',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'view_count',
            'download_count',
            'ai_generated',
            'ai_model_used',
            'created_at',
            'updated_at',
        ]