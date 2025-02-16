VALID_PRODUCTS_DATA = [
    {
        'sku': 'PROD001',
        'customer': 1,
        'labeling_unit_1': 'Box',
        'labeling_quantity_1': 10,
        'labeling_unit_2': 'Case',
        'labeling_quantity_2': 5,
        'labeling_unit_3': 'Pallet',
        'labeling_quantity_3': 2,
        'labeling_unit_4': None,
        'labeling_quantity_4': None,
        'labeling_unit_5': None,
        'labeling_quantity_5': None
    },
    {
        'sku': 'PROD002',
        'customer': 2,
        'labeling_unit_1': 'Piece',
        'labeling_quantity_1': 1,
        'labeling_unit_2': 'Box',
        'labeling_quantity_2': 50,
        'labeling_unit_3': None,
        'labeling_quantity_3': None,
        'labeling_unit_4': None,
        'labeling_quantity_4': None,
        'labeling_unit_5': None,
        'labeling_quantity_5': None
    }
]

INVALID_PRODUCTS_DATA = [
    {
        # Missing required SKU
        'customer': 1,
        'labeling_unit_1': 'Box',
        'labeling_quantity_1': 10
    },
    {
        'sku': 'PROD003',
        # Missing required customer
        'labeling_unit_1': 'Box',
        'labeling_quantity_1': 10
    },
    {
        'sku': 'PROD004',
        'customer': 1,
        'labeling_unit_1': 'Box',
        'labeling_quantity_1': -5  # Invalid negative quantity
    },
    {
        'sku': 'A' * 60,  # SKU too long (max 50 chars)
        'customer': 1,
        'labeling_unit_1': 'Box',
        'labeling_quantity_1': 10
    }
] 