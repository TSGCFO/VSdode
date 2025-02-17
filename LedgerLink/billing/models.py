# Create your models here.
from django.db import models
from django.core.validators import MinValueValidator
from customers.models import Customer
from orders.models import Order
from django.contrib.postgres.fields import JSONField

class BillingReport(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    total_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    generated_at = models.DateTimeField(auto_now_add=True)
    report_data = models.JSONField()

    class Meta:
        verbose_name = 'Billing Report'
        verbose_name_plural = 'Billing Reports'
        ordering = ['-generated_at']

    def __str__(self):
        return f"Report for {self.customer.company_name} ({self.start_date} to {self.end_date})"

class BillingReportDetail(models.Model):
    report = models.ForeignKey(BillingReport, on_delete=models.CASCADE, related_name='details')
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    service_breakdown = models.JSONField()
    total_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )

    class Meta:
        verbose_name = 'Billing Report Detail'
        verbose_name_plural = 'Billing Report Details'

class BillingServiceRate(models.Model):
    customer_service_id = models.IntegerField(primary_key=True)
    customer_id = models.IntegerField()
    service_id = models.IntegerField()
    service_name = models.CharField(max_length=100)
    charge_type = models.CharField(max_length=10)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    assigned_skus = models.JSONField(null=True)
    billing_type = models.CharField(max_length=10)

    class Meta:
        managed = False
        db_table = 'billing_service_rates'

class OrderBillingDetail(models.Model):
    transaction_id = models.IntegerField(primary_key=True)
    customer_id = models.IntegerField()
    close_date = models.DateTimeField()
    sku_quantity = models.JSONField(null=True)
    total_item_qty = models.IntegerField(null=True)
    status = models.CharField(max_length=20)
    product_details = models.JSONField(null=True)

    class Meta:
        managed = False
        db_table = 'order_billing_details'

class ServiceRuleEvaluation(models.Model):
    customer_service_id = models.IntegerField()
    rule_group_id = models.IntegerField(primary_key=True)
    logic_operator = models.CharField(max_length=10)
    rules = models.JSONField()

    class Meta:
        managed = False
        db_table = 'service_rule_evaluation'

class BillingCalculationCache(models.Model):
    transaction_id = models.IntegerField()
    customer_id = models.IntegerField()
    customer_service_id = models.IntegerField()
    service_name = models.CharField(max_length=100)
    charge_type = models.CharField(max_length=10)
    billing_type = models.CharField(max_length=10)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    sku_quantity = models.JSONField(null=True)
    product_details = models.JSONField(null=True)
    rules = models.JSONField(null=True)

    class Meta:
        managed = False
        db_table = 'billing_calculation_cache'

    @classmethod
    def refresh(cls):
        """Refresh the materialized view"""
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("REFRESH MATERIALIZED VIEW billing_calculation_cache")