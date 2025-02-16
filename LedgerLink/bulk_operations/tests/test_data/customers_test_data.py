VALID_CUSTOMERS_DATA = [
    {
        'company_name': 'Acme Corporation',
        'legal_business_name': 'Acme Corp LLC',
        'email': 'contact@acme.com',
        'phone': '555-123-4567',
        'address': '123 Business Ave',
        'city': 'Los Angeles',
        'state': 'CA',
        'zip': '90001',
        'country': 'USA',
        'business_type': 'Manufacturing'
    },
    {
        'company_name': 'Tech Solutions Inc',
        'legal_business_name': 'Tech Solutions Incorporated',
        'email': 'info@techsolutions.com',
        'phone': '555-987-6543',
        'address': '456 Innovation Dr',
        'city': 'San Francisco',
        'state': 'CA',
        'zip': '94105',
        'country': 'USA',
        'business_type': 'Technology'
    }
]

INVALID_CUSTOMERS_DATA = [
    {
        # Missing required company_name
        'legal_business_name': 'Invalid Corp LLC',
        'email': 'invalid@test.com',
        'phone': '555-111-2222'
    },
    {
        'company_name': 'Invalid Email Corp',
        'legal_business_name': 'Invalid Email Corp LLC',
        'email': 'not-an-email',  # Invalid email format
        'phone': '555-333-4444'
    },
    {
        'company_name': 'Too Long Corp',
        'legal_business_name': 'Too Long Corp LLC',
        'email': 'valid@test.com',
        'phone': '1' * 30  # Phone number too long (max 20 chars)
    }
] 