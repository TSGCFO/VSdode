VALID_SERVICES_DATA = [
    {
        'service_name': 'Standard Shipping',
        'description': 'Regular ground shipping service with 3-5 day delivery',
        'charge_type': 'quantity'
    },
    {
        'service_name': 'Express Handling',
        'description': 'Premium handling service with same-day processing',
        'charge_type': 'single'
    },
    {
        'service_name': 'Custom Packaging',
        'description': None,  # Optional description
        'charge_type': 'quantity'
    }
]

INVALID_SERVICES_DATA = [
    {
        # Missing required service_name
        'description': 'Invalid service',
        'charge_type': 'quantity'
    },
    {
        'service_name': 'Invalid Charge Type',
        'description': 'Service with invalid charge type',
        'charge_type': 'invalid'  # Invalid choice
    },
    {
        'service_name': 'A' * 300,  # Name too long (max 255 chars)
        'description': 'Valid description',
        'charge_type': 'single'
    },
    {
        'service_name': 'Long Description',
        'description': 'A' * 1200,  # Description too long (max 1000 chars)
        'charge_type': 'quantity'
    }
] 