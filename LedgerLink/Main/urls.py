# Main/urls.py
from django.urls import path
from .views import HomeView, DashboardView

app_name = 'main'

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
]