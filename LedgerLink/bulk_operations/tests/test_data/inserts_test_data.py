VALID_INSERTS_DATA = [
    {
        'sku': 'INS001',
        'insert_name': 'Product Manual',
        'insert_quantity': 100,
        'customer': 1
    },
    {
        'sku': 'INS002',
        'insert_name': 'Warranty Card',
        'insert_quantity': 50,
        'customer': 2
    },
    {
        'sku': 'INS003',
        'insert_name': 'Thank You Note',
        'insert_quantity': 200,
        'customer': 1
    }
]

INVALID_INSERTS_DATA = [
    {
        # Missing required SKU
        'insert_name': 'Invalid Insert',
        'insert_quantity': 100,
        'customer': 1
    },
    {
        'sku': 'INS004',
        # Missing required insert_name
        'insert_quantity': 100,
        'customer': 1
    },
    {
        'sku': 'INS005',
        'insert_name': 'Negative Quantity',
        'insert_quantity': -50,  # Invalid negative quantity
        'customer': 1
    },
    {
        'sku': 'A' * 60,  # SKU too long (max 50 chars)
        'insert_name': 'Valid Name',
        'insert_quantity': 100,
        'customer': 1
    },
    {
        'sku': 'INS006',
        'insert_name': 'A' * 300,  # Name too long (max 255 chars)
        'insert_quantity': 100,
        'customer': 1
    },
    {
        'sku': 'INS007',
        'insert_name': 'Missing Customer',
        'insert_quantity': 100
        # Missing required customer
    }
] 