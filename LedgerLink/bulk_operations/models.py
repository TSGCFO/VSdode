from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class BulkImportLog(models.Model):
    """
    Model to track bulk import operations.
    """
    IMPORT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('validating', 'Validating'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('partially_completed', 'Partially Completed'),
        ('failed', 'Failed'),
    ]

    template_type = models.CharField(max_length=50)
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField()
    total_rows = models.IntegerField()
    successful_rows = models.IntegerField(default=0)
    failed_rows = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=IMPORT_STATUS_CHOICES, default='pending')
    errors = models.JSONField(null=True, blank=True)
    started_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ['-started_at']
        verbose_name = 'Bulk Import Log'
        verbose_name_plural = 'Bulk Import Logs'

    def __str__(self):
        return f"{self.template_type} import - {self.file_name} ({self.status})"

    @property
    def duration(self):
        """Calculate the duration of the import operation."""
        if self.completed_at:
            return self.completed_at - self.started_at
        return None

    @property
    def success_rate(self):
        """Calculate the success rate of the import operation."""
        if self.total_rows > 0:
            return (self.successful_rows / self.total_rows) * 100
        return 0.0
