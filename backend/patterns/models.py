from django.db import models
from django.contrib.auth.models import User
from projects.models import Project


class Pattern(models.Model):

    DIFFICULTY_CHOICES = [
        ('beginner',     'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced',     'Advanced'),
    ]

    STATUS_CHOICES = [
        ('draft',     'Draft'),      # AI generated, not reviewed yet
        ('published', 'Published'),  # Reviewed and made public
        ('archived',  'Archived'),   # Hidden from public
    ]

    # Link to the project this pattern was generated from
    project     = models.OneToOneField(
        Project,
        on_delete=models.CASCADE,
        related_name='pattern'
    )
    created_by  = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='patterns'
    )

    # Core pattern info
    title           = models.CharField(max_length=200)
    description     = models.TextField(blank=True)
    difficulty      = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

    # Materials
    yarn_weight     = models.CharField(max_length=50,  blank=True)
    hook_size       = models.CharField(max_length=20,  blank=True)
    gauge           = models.CharField(max_length=100, blank=True)
    yarn_amount     = models.CharField(max_length=100, blank=True)

    # The actual pattern content (AI generated)
    abbreviations   = models.JSONField(default=dict)   # e.g. {"sc": "single crochet", "ch": "chain"}
    materials_list  = models.JSONField(default=list)   # list of required materials
    instructions    = models.TextField()               # full written pattern
    notes           = models.TextField(blank=True)     # tips, variations, finishing

    # Sizing
    sizes_available = models.JSONField(default=list)   # e.g. ["S", "M", "L"] or ["30cm", "45cm"]
    finished_size   = models.CharField(max_length=100, blank=True)

    # AI metadata — important for your portfolio/CV
    ai_generated    = models.BooleanField(default=True)
    ai_model_used   = models.CharField(max_length=100, default='claude-sonnet-4-20250514')
    ai_prompt_used  = models.TextField(blank=True)     # store the prompt for transparency
    ai_confidence   = models.FloatField(null=True, blank=True)  # 0.0 to 1.0
    chart_data = models.JSONField(default=dict, blank=True)

    # Engagement
    view_count      = models.PositiveIntegerField(default=0)
    download_count  = models.PositiveIntegerField(default=0)

    # Timestamps
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Pattern: {self.title} (from {self.project.title})"
    
class ColourPalette(models.Model):
    """
    AI-suggested colour combinations for a pattern.
    Each pattern can have multiple suggested palettes.
    """
    MOOD_CHOICES = [
        ('warm',       'Warm'),
        ('cool',       'Cool'),
        ('neutral',    'Neutral'),
        ('bold',       'Bold'),
        ('pastel',     'Pastel'),
        ('earthy',     'Earthy'),
        ('monochrome', 'Monochrome'),
    ]

    pattern         = models.ForeignKey(
        Pattern,
        on_delete=models.CASCADE,
        related_name='colour_palettes'
    )
    name            = models.CharField(max_length=100)  # e.g. "Autumn Harvest"
    mood            = models.CharField(max_length=20, choices=MOOD_CHOICES, default='neutral')
    colors          = models.JSONField(default=list)    # list of hex codes e.g. ["#FF5733", "#FFC300"]
    color_names     = models.JSONField(default=list)    # e.g. ["Burnt Orange", "Golden Yellow"]
    ai_generated    = models.BooleanField(default=True)
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['mood', 'name']

    def __str__(self):
        return f"{self.name} palette for {self.pattern.title}"