from django.db import models
from django.utils import timezone
from customers.models import Customer
from django.core.exceptions import ValidationError


class Product(models.Model):
    id = models.BigAutoField(primary_key=True)
    sku = models.CharField(max_length=100)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    labeling_unit_1 = models.CharField(max_length=50, null=True, blank=True)
    labeling_quantity_1 = models.PositiveIntegerField(null=True, blank=True)
    labeling_unit_2 = models.CharField(max_length=50, null=True, blank=True)
    labeling_quantity_2 = models.PositiveIntegerField(null=True, blank=True)
    labeling_unit_3 = models.CharField(max_length=50, null=True, blank=True)
    labeling_quantity_3 = models.PositiveIntegerField(null=True, blank=True)
    labeling_unit_4 = models.CharField(max_length=50, null=True, blank=True)
    labeling_quantity_4 = models.PositiveIntegerField(null=True, blank=True)
    labeling_unit_5 = models.CharField(max_length=50, null=True, blank=True)
    labeling_quantity_5 = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['sku', 'customer'],
                name='billing_product_sku_customer_id_uniq'
            ),
            models.CheckConstraint(
                check=models.Q(labeling_quantity_1__gte=0),
                name='billing_product_labeling_quantity_1_check'
            ),
            models.CheckConstraint(
                check=models.Q(labeling_quantity_2__gte=0),
                name='billing_product_labeling_quantity_2_check'
            ),
            models.CheckConstraint(
                check=models.Q(labeling_quantity_3__gte=0),
                name='billing_product_labeling_quantity_3_check'
            ),
            models.CheckConstraint(
                check=models.Q(labeling_quantity_4__gte=0),
                name='billing_product_labeling_quantity_4_check'
            ),
            models.CheckConstraint(
                check=models.Q(labeling_quantity_5__gte=0),
                name='billing_product_labeling_quantity_5_check'
            ),
        ]

    def __str__(self):
        return f"{self.customer} - {self.sku}"

    def clean(self):
        """Validate the product data"""
        super().clean()
        
        # Get all non-empty labeling units and quantities
        units = []
        quantities = []
        for i in range(1, 6):
            unit = getattr(self, f'labeling_unit_{i}')
            qty = getattr(self, f'labeling_quantity_{i}')
            
            if unit and qty:
                # Check for duplicate unit names
                if unit.lower() in [u.lower() for u in units]:
                    raise ValidationError(f'Duplicate labeling unit name: {unit}')
                units.append(unit)
                
                # Check for duplicate quantities
                if qty in quantities:
                    raise ValidationError(f'Duplicate labeling quantity: {qty}')
                quantities.append(qty)
                
                # Check if current quantity is less than previous quantity
                if quantities and len(quantities) > 1 and qty <= quantities[-2]:
                    raise ValidationError(
                        f'Labeling quantity {i} ({qty}) must be greater than the previous quantity ({quantities[-2]})'
                    )
        
        # Ensure no gaps in labeling units (can't have unit 1 and 3 without 2)
        for i in range(1, 5):
            current_unit = getattr(self, f'labeling_unit_{i}')
            next_unit = getattr(self, f'labeling_unit_{i+1}')
            current_qty = getattr(self, f'labeling_quantity_{i}')
            next_qty = getattr(self, f'labeling_quantity_{i+1}')
            
            if next_unit and next_qty and not (current_unit and current_qty):
                raise ValidationError(
                    f'Cannot have labeling unit {i+1} without labeling unit {i}'
                )

    def save(self, *args, **kwargs):
        """Override save to run full validation"""
        self.full_clean()
        super().save(*args, **kwargs)