VALID_CAD_SHIPPING_DATA = [
    {
        'transaction': 2001,
        'customer': 1,
        'service_code_description': 'Standard Ground',
        'ship_to_name': 'John Smith',
        'ship_to_address_1': '123 Maple St',
        'ship_to_address_2': 'Unit 5',
        'shiptoaddress3': 'Building A',
        'ship_to_city': 'Toronto',
        'ship_to_state': 'ON',
        'ship_to_country': 'CA',
        'ship_to_postal_code': 'M5V 2T6',
        'tracking_number': 'CA123456789',
        'pre_tax_shipping_charge': 45.99,
        'tax1type': 'GST',
        'tax1amount': 2.30,
        'tax2type': 'PST',
        'tax2amount': 3.68,
        'tax3type': 'HST',
        'tax3amount': 5.98,
        'fuel_surcharge': 8.50,
        'reference': 'REF001',
        'weight': 12.5,
        'gross_weight': 13.0,
        'box_length': 15,
        'box_width': 10,
        'box_height': 8,
        'box_name': 'Standard Box',
        'carrier': 'Canada Post'
    },
    {
        'transaction': 2002,
        'customer': 2,
        'ship_to_name': 'Jane Doe',
        'ship_to_address_1': '456 Oak St',
        'ship_to_city': 'Vancouver',
        'ship_to_state': 'BC',
        'ship_to_postal_code': 'V6B 4N7',
        'tracking_number': 'CA987654321',
        'pre_tax_shipping_charge': 35.99,
        'tax1type': 'GST',
        'tax1amount': 1.80,
        'fuel_surcharge': 5.50,
        'weight': 8.5,
        'box_length': 12,
        'box_width': 8,
        'box_height': 6
    }
]

INVALID_CAD_SHIPPING_DATA = [
    {
        # Missing required transaction
        'customer': 1,
        'ship_to_name': 'Invalid Name',
        'ship_to_address_1': '789 Error St',
        'ship_to_city': 'Montreal',
        'ship_to_state': 'QC',
        'ship_to_postal_code': 'H2Y 1Z7'
    },
    {
        'transaction': 2003,
        'customer': 1,
        'ship_to_name': 'A' * 300,  # Name too long (max 255 chars)
        'ship_to_address_1': '789 Error St',
        'ship_to_city': 'Montreal',
        'ship_to_state': 'QC',
        'ship_to_postal_code': 'H2Y 1Z7'
    },
    {
        'transaction': 2004,
        'customer': 1,
        'ship_to_name': 'Invalid Weight',
        'ship_to_address_1': '789 Error St',
        'ship_to_city': 'Montreal',
        'ship_to_state': 'QC',
        'ship_to_postal_code': 'H2Y 1Z7',
        'weight': -5.0  # Invalid negative weight
    },
    {
        'transaction': 2005,
        'customer': 1,
        'ship_to_name': 'Invalid Tax',
        'ship_to_address_1': '789 Error St',
        'ship_to_city': 'Montreal',
        'ship_to_state': 'QC',
        'ship_to_postal_code': 'H2Y 1Z7',
        'tax1amount': -2.50  # Invalid negative tax amount
    }
] 