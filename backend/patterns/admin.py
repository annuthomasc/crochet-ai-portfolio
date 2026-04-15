from django.contrib import admin
from .models import Pattern, ColourPalette


class ColourPaletteInline(admin.TabularInline):
    model  = ColourPalette
    extra  = 1
    fields = ['name', 'mood', 'colors', 'color_names', 'ai_generated']


@admin.register(Pattern)
class PatternAdmin(admin.ModelAdmin):
    list_display    = ['title', 'project', 'difficulty', 'status', 'ai_generated', 'view_count', 'download_count', 'created_at']
    list_filter     = ['difficulty', 'status', 'ai_generated']
    search_fields   = ['title', 'description', 'instructions']
    readonly_fields = ['created_at', 'updated_at', 'view_count', 'download_count', 'ai_model_used']
    inlines         = [ColourPaletteInline]

    fieldsets = (
        ('Pattern Info', {
            'fields': ('title', 'description', 'project', 'created_by', 'difficulty', 'status')
        }),
        ('Materials', {
            'fields': ('yarn_weight', 'hook_size', 'gauge', 'yarn_amount', 'materials_list')
        }),
        ('Instructions', {
            'fields': ('abbreviations', 'instructions', 'notes')
        }),
        ('Sizing', {
            'fields': ('sizes_available', 'finished_size')
        }),
        ('AI Metadata', {
            'fields': ('ai_generated', 'ai_model_used', 'ai_prompt_used', 'ai_confidence'),
            'classes': ('collapse',)  # hidden by default, expandable
        }),
        ('Stats', {
            'fields': ('view_count', 'download_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ColourPalette)
class ColourPaletteAdmin(admin.ModelAdmin):
    list_display  = ['name', 'pattern', 'mood', 'ai_generated', 'created_at']
    list_filter   = ['mood', 'ai_generated']
    search_fields = ['name', 'pattern__title']
