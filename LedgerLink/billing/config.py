from decimal import Decimal
from typing import Dict, Any
from datetime import timedelta

class BillingConfiguration:
    """Configuration settings for the billing system"""
    
    # Service calculation methods
    SERVICE_CALCULATION_METHODS = {
        'SKU Cost': 'unique_skus',      # Calculate based on unique SKUs
        'Pick Cost': 'total_qty',       # Calculate based on total quantity
        'Case Pick': 'total_qty',       # Calculate based on total quantity
        'Single Service': 'single',      # Apply once per order
        'Storage Fee': 'single'         # Apply once per order
    }
    
    # Default calculation method if service type not found
    DEFAULT_CALCULATION_METHOD = 'single'
    
    # Service total format settings
    SERVICE_TOTAL_FORMAT = {
        'use_dict_format': True,        # If True, use dictionary format for service totals
        'include_service_name': True,    # Include service name in totals
        'decimal_places': 2,            # Number of decimal places for amounts
        'min_amount': Decimal('0.01')   # Minimum amount to include in totals
    }
    
    # Report generation settings
    REPORT_SETTINGS = {
        'include_zero_amounts': False,   # Whether to include services with zero amounts
        'sort_services': True,          # Sort services by name in report
        'group_by_service': True,       # Group costs by service in report
        'max_date_range': timedelta(days=365),  # Maximum allowed date range
        'default_date_format': '%Y-%m-%d',      # Default date format for string dates
        'supported_date_formats': [            # List of supported date formats
            '%Y-%m-%d',
            '%Y-%m-%dT%H:%M:%S',
            '%Y-%m-%dT%H:%M:%S.%fZ',
            '%m/%d/%Y',
            '%d/%m/%Y'
        ]
    }
    
    @staticmethod
    def get_service_calculation_method(service_name: str) -> str:
        """Get the calculation method for a service"""
        return BillingConfiguration.SERVICE_CALCULATION_METHODS.get(
            service_name, BillingConfiguration.DEFAULT_CALCULATION_METHOD
        )
    
    @staticmethod
    def format_service_total(service_id: int, service_name: str, amount: Decimal) -> Dict[str, Any]:
        """Format a service total according to configuration"""
        # Round amount to configured decimal places
        amount = round(amount, BillingConfiguration.SERVICE_TOTAL_FORMAT['decimal_places'])
        
        if BillingConfiguration.SERVICE_TOTAL_FORMAT['use_dict_format']:
            result = {
                'service_id': service_id,
                'total_amount': amount
            }
            if BillingConfiguration.SERVICE_TOTAL_FORMAT['include_service_name']:
                result['service_name'] = service_name
            return result
        return amount
    
    @staticmethod
    def should_include_in_report(amount: Decimal) -> bool:
        """Determine if an amount should be included in the report"""
        if not BillingConfiguration.REPORT_SETTINGS['include_zero_amounts']:
            return amount >= BillingConfiguration.SERVICE_TOTAL_FORMAT['min_amount']
        return True
    
    @staticmethod
    def validate_date_range(start_date, end_date) -> bool:
        """Validate if the date range is within allowed limits"""
        date_diff = end_date - start_date
        return date_diff <= BillingConfiguration.REPORT_SETTINGS['max_date_range']
    
    @staticmethod
    def format_date(date) -> str:
        """Format a date according to the default format"""
        return date.strftime(BillingConfiguration.REPORT_SETTINGS['default_date_format']) 