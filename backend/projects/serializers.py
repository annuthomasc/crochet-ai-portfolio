from rest_framework import serializers
from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')
    image_url      = serializers.SerializerMethodField()

    class Meta:
        model  = Project
        fields = [
            'id',
            'title',
            'description',
            'category',
            'difficulty',
            'status',
            'yarn_brand',
            'yarn_weight',
            'yarn_colors',
            'hook_size',
            'image',
            'image_url',
            'has_pattern',
            'is_public',
            'owner',
            'owner_username',
            'created_at',
            'updated_at',
            'completed_at',
        ]
        read_only_fields = ['owner', 'created_at', 'updated_at', 'has_pattern']

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None


class ProjectListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing projects — less data over the wire."""
    image_url = serializers.SerializerMethodField()

    class Meta:
        model  = Project
        fields = [
            'id',
            'title',
            'category',
            'difficulty',
            'status',
            'image_url',
            'has_pattern',
            'is_public',
            'yarn_colors',
            'created_at',
        ]

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None