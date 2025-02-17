# customer_services/models.py

from django.db import models
from customers.models import Customer
from services.models import Service
from products.models import Product


class CustomerService(models.Model):
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    skus = models.ManyToManyField(Product, blank=True, related_name='customer_services')

    class Meta:
        unique_together = (('customer', 'service'),)

    def __str__(self):
        return f"{self.customer} - {self.service}"

    def get_skus(self):
        """Get all SKUs associated with this customer service."""
        return self.skus.all()

    def get_sku_list(self):
        """Get a list of SKU codes associated with this customer service."""
        return list(self.skus.values_list('sku', flat=True))

    @property
    def normalized_skus(self):
        """Returns normalized list of assigned SKUs"""
        return [sku.strip().upper() for sku in self.get_sku_list()]

    @property
    def billing_type(self):
        """Returns the billing type based on service name"""
        service_name = self.service.service_name.lower()
        if 'pick cost' in service_name:
            return 'pick'
        elif 'case pick' in service_name:
            return 'case'
        elif 'sku cost' in service_name:
            return 'sku'
        return 'standard'

class CustomerServiceView(models.Model):
    id = models.IntegerField(primary_key=True)  # Keep ID for reference
    customer_service = models.CharField(max_length=255)  # Stores "Customer - Service"

    class Meta:
        managed = False  # Django should NOT create or modify this view
        db_table = 'customer_service_view'  # Match the PostgreSQL view name

    def __str__(self):
        return self.customer_service
