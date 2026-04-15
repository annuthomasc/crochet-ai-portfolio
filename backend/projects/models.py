from django.db import models
from django.contrib.auth.models import User


class Project(models.Model):

    CATEGORY_CHOICES = [
        ('table_mat',  'Table Mat'),
        ('shawl',      'Shawl'),
        ('throw',      'Throw'),
        ('blanket',    'Blanket'),
        ('amigurumi',  'Amigurumi'),
        ('bag',        'Bag'),
        ('clothing',   'Clothing'),
        ('accessory',  'Accessory'),
        ('other',      'Other'),
    ]

    DIFFICULTY_CHOICES = [
        ('beginner',     'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced',     'Advanced'),
    ]

    STATUS_CHOICES = [
        ('completed',    'Completed'),
        ('in_progress',  'In Progress'),
        ('frogged',      'Frogged'),  # crochet term for unravelled!
    ]

    # Core fields
    title           = models.CharField(max_length=200)
    description     = models.TextField(blank=True)
    category        = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    difficulty      = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')

    # Yarn details
    yarn_brand      = models.CharField(max_length=100, blank=True)
    yarn_weight     = models.CharField(max_length=50,  blank=True)
    yarn_colors     = models.JSONField(default=list)   # stores list of color hex codes
    hook_size       = models.CharField(max_length=20,  blank=True)

    # Image (uploaded to Cloudinary)
    image           = models.ImageField(upload_to='projects/', blank=True, null=True)

    # Pattern availability
    has_pattern     = models.BooleanField(default=False)
    is_public       = models.BooleanField(default=True)

    # Relationships
    owner           = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')

    # Timestamps
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)
    completed_at    = models.DateField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.category})"