# orders/models.py

from django.db import models
from customers.models import Customer
import json
from decimal import Decimal


class Order(models.Model):
    PRIORITY_CHOICES = [ # Choices for the priority field in the Order model
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    STATUS_CHOICES = [ # Choices for the status field in the Order model
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    transaction_id = models.IntegerField(primary_key=True)  # Externally assigned
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    close_date = models.DateTimeField(blank=True, null=True)
    reference_number = models.CharField(max_length=100)
    ship_to_name = models.CharField(max_length=100, blank=True, null=True)
    ship_to_company = models.CharField(max_length=100, blank=True, null=True)
    ship_to_address = models.CharField(max_length=200, blank=True, null=True)
    ship_to_address2 = models.CharField(max_length=200, blank=True, null=True)
    ship_to_city = models.CharField(max_length=100, blank=True, null=True)
    ship_to_state = models.CharField(max_length=50, blank=True, null=True)
    ship_to_zip = models.CharField(max_length=20, blank=True, null=True)
    ship_to_country = models.CharField(max_length=50, blank=True, null=True)
    weight_lb = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    line_items = models.IntegerField(blank=True, null=True)
    sku_quantity = models.JSONField(blank=True, null=True)
    total_item_qty = models.IntegerField(blank=True, null=True)
    volume_cuft = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    packages = models.IntegerField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    carrier = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft'
    )
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='medium'
    )

    def __str__(self):
        return f"Order {self.transaction_id} for {self.customer}"
    
    @property
    def billable_sku_quantities(self):
        """Returns normalized SKU quantities for billing"""
        try:
            if not self.sku_quantity:
                return {}
            
            if isinstance(self.sku_quantity, str):
                sku_data = json.loads(self.sku_quantity)
            else:
                sku_data = self.sku_quantity

            return {
                sku['sku'].strip().upper(): float(sku['quantity'])
                for sku in sku_data
                if isinstance(sku, dict) and 'sku' in sku and 'quantity' in sku
            }
        except (json.JSONDecodeError, AttributeError):
            return {}

    @property
    def case_quantities(self):
        """Returns case quantities for each SKU"""
        from products.models import Product
        
        sku_quantities = self.billable_sku_quantities
        case_quantities = {}
        
        for sku, quantity in sku_quantities.items():
            try:
                product = Product.objects.get(
                    sku=sku,
                    customer_id=self.customer_id
                )
                
                # Check all labeling units for cases
                for unit_num in range(1, 6):  # Check units 1 through 5
                    unit_field = f'labeling_unit_{unit_num}'
                    qty_field = f'labeling_quantity_{unit_num}'
                    
                    unit = getattr(product, unit_field)
                    qty = getattr(product, qty_field)
                    
                    if (unit and 
                        unit.lower() == 'case' and 
                        qty and 
                        qty > 1):
                        case_size = qty
                        full_cases = quantity // case_size
                        remaining_units = quantity % case_size
                        
                        # If we already found a case quantity for this SKU,
                        # only update if this case size is larger
                        if sku in case_quantities:
                            if case_size > case_quantities[sku]['case_size']:
                                case_quantities[sku] = {
                                    'full_cases': full_cases,
                                    'remaining_units': remaining_units,
                                    'case_size': case_size,
                                    'unit_number': unit_num
                                }
                        else:
                            case_quantities[sku] = {
                                'full_cases': full_cases,
                                'remaining_units': remaining_units,
                                'case_size': case_size,
                                'unit_number': unit_num
                            }
                        
                        # Once we find a case quantity, we can break since we want
                        # to use the first (smallest) case size found
                        break
                    
            except Product.DoesNotExist:
                continue
        
        return case_quantities

# orders/models.py

class OrderSKUView(models.Model):
    transaction_id = models.IntegerField()  # Keep transaction_id for linking SKUs to orders
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    reference_number = models.CharField(max_length=100)
    sku_name = models.CharField(max_length=100)
    sku_count = models.IntegerField()

    class Meta:
        managed = False  # This tells Django not to create or modify this table
        db_table = 'orders_sku_view'  # Name of the view in PostgreSQL

    def __str__(self):
        return f"Order {self.transaction_id} - {self.sku_name}: {self.sku_count}"

