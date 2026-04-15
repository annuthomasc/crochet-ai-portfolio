from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display  = ['title', 'category', 'difficulty', 'status', 'has_pattern', 'is_public', 'created_at']
    list_filter   = ['category', 'difficulty', 'status', 'has_pattern', 'is_public']
    search_fields = ['title', 'description', 'yarn_brand']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Project Info', {
            'fields': ('title', 'description', 'category', 'difficulty', 'status', 'image')
        }),
        ('Yarn Details', {
            'fields': ('yarn_brand', 'yarn_weight', 'yarn_colors', 'hook_size')
        }),
        ('Visibility', {
            'fields': ('is_public', 'has_pattern', 'owner')
        }),
        ('Dates', {
            'fields': ('completed_at', 'created_at', 'updated_at')
        }),
    )