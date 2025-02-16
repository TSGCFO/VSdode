# bulk_operations/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BulkOperationViewSet, TemplateDownloadView, BulkImportView, ImportHistoryViewSet

router = DefaultRouter()
router.register(r'operations', BulkOperationViewSet, basename='bulk-operations')
router.register(r'history', ImportHistoryViewSet, basename='import-history')

urlpatterns = [
    path('', include(router.urls)),
    path('download/<str:template_type>/', TemplateDownloadView.as_view(), name='template-download'),
    path('import/<str:template_type>/', BulkImportView.as_view(), name='bulk-import'),
]
