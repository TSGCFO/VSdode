from decimal import Decimal
from typing import Dict, List, Any
import json

from .billing_calculator import BillingCalculator, ServiceCost, OrderCost
from .config import BillingConfiguration
from orders.models import Order
from customer_services.models import CustomerService
from services.models import Service

class BillingService:
    """Service layer for billing operations"""
    
    def __init__(self, calculator: BillingCalculator):
        self.calculator = calculator
        
    def calculate_service_cost(self, customer_service: CustomerService, order: Order) -> Decimal:
        """Calculate service cost using configuration-based rules"""
        # Apply configuration-based calculations
        calc_method = BillingConfiguration.get_service_calculation_method(
            customer_service.service.service_name
        )
        
        if calc_method == 'unique_skus':
            # Count unique SKUs
            sku_data = json.loads(order.sku_quantity)
            unique_skus = len({item['sku'].strip().upper() for item in sku_data})
            return customer_service.unit_price * Decimal(str(unique_skus))
            
        elif calc_method == 'total_qty':
            # Use total quantity
            return customer_service.unit_price * Decimal(str(order.total_item_qty))
            
        elif calc_method == 'single':
            # Apply once per order
            return customer_service.unit_price
            
        # If no specific calculation method, use the calculator's method
        return self.calculator.calculate_service_cost(customer_service, order)
    
    def format_service_totals(self, service_totals: Dict[int, Dict[str, Any]]) -> Dict[str, Any]:
        """Format service totals according to configuration"""
        formatted_totals = {}
        
        for service_id, data in service_totals.items():
            if BillingConfiguration.should_include_in_report(data['total_amount']):
                formatted_totals[service_id] = BillingConfiguration.format_service_total(
                    service_id,
                    data['service_name'],
                    data['total_amount']
                )
                
        return formatted_totals
    
    def get_order_services(self, order: Order) -> List[Service]:
        """Get services associated with an order"""
        try:
            services_data = json.loads(order.services) if order.services else []
            service_ids = [item['service'] for item in services_data]
            return Service.objects.filter(id__in=service_ids)
        except (json.JSONDecodeError, KeyError, AttributeError):
            return []
    
    def generate_report(self) -> Dict[str, Any]:
        """Generate a report using configuration settings"""
        # Get base report from calculator
        report = self.calculator.generate_report()
        
        # Format the report data with proper datetime handling
        formatted_data = {
            'customer_id': report.customer_id,
            'start_date': report.start_date.isoformat(),
            'end_date': report.end_date.isoformat(),
            'orders': [
                {
                    'order_id': oc.order_id,
                    'total_amount': str(oc.total_amount),
                    'services': [
                        {
                            'service_id': sc.service_id,
                            'service_name': sc.service_name,
                            'amount': str(sc.amount)
                        }
                        for sc in oc.service_costs
                    ]
                }
                for oc in report.order_costs
            ],
            'service_totals': [
                {
                    'service_id': service_id,
                    'service_name': data['service_name'],
                    'total_amount': str(data['total_amount'])
                }
                for service_id, data in report.service_totals.items()
                if BillingConfiguration.should_include_in_report(data['total_amount'])
            ],
            'total_amount': str(report.total_amount)
        }
        
        return formatted_data 