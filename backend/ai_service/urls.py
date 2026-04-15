from django.urls import path
from .views import (
    GeneratePatternView,
    GenerateColourSuggestionsView,
    DetectStitchesView,
    AIHealthCheckView,
)

urlpatterns = [
    path('generate-pattern/',     GeneratePatternView.as_view(),            name='generate-pattern'),
    path('colour-suggestions/',   GenerateColourSuggestionsView.as_view(),  name='colour-suggestions'),
    path('detect-stitches/',      DetectStitchesView.as_view(),             name='detect-stitches'),
    path('health/',               AIHealthCheckView.as_view(),              name='ai-health'),
]