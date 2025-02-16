VALID_MATERIALS_DATA = [
    {
        'name': 'Cardboard Box',
        'description': 'Standard shipping box 12x12x12',
        'unit_price': 2.50
    },
    {
        'name': 'Bubble Wrap',
        'description': 'Heavy-duty bubble wrap for fragile items',
        'unit_price': 1.75
    },
    {
        'name': 'Packing Tape',
        'description': None,  # Optional description
        'unit_price': 3.99
    }
]

INVALID_MATERIALS_DATA = [
    {
        # Missing required name
        'description': 'Invalid material',
        'unit_price': 1.00
    },
    {
        'name': 'Negative Price',
        'description': 'Material with invalid price',
        'unit_price': -5.00  # Invalid negative price
    },
    {
        'name': 'A' * 300,  # Name too long (max 255 chars)
        'description': 'Valid description',
        'unit_price': 1.00
    },
    {
        'name': 'Long Description',
        'description': 'A' * 1200,  # Description too long (max 1000 chars)
        'unit_price': 1.00
    },
    {
        'name': 'Missing Price',
        'description': 'Material without price',
        # Missing required unit_price
    }
] 