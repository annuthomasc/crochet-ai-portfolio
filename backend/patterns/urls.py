from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatternViewSet

router = DefaultRouter()
router.register(r'', PatternViewSet, basename='pattern')

urlpatterns = [
    path('', include(router.urls)),
]