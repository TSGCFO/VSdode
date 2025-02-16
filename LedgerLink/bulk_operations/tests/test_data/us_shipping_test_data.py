VALID_US_SHIPPING_DATA = [
    {
        'transaction': 1001,
        'customer': 1,
        'ship_date': '2024-02-15',
        'ship_to_name': 'John Smith',
        'ship_to_address_1': '123 Main St',
        'ship_to_address_2': 'Suite 100',
        'ship_to_city': 'New York',
        'ship_to_state': 'NY',
        'ship_to_zip': '10001',
        'ship_to_country_code': 'US',
        'tracking_number': 'US123456789',
        'service_name': 'Ground',
        'weight_lbs': 15.5,
        'length_in': 12,
        'width_in': 8,
        'height_in': 6,
        'base_chg': 25.99,
        'carrier_peak_charge': 2.50,
        'wizmo_peak_charge': 1.50,
        'accessorial_charges': 5.00,
        'rate': 34.99,
        'current_status': 'in_transit',
        'delivery_status': 'pending'
    },
    {
        'transaction': 1002,
        'customer': 2,
        'ship_date': '2024-02-16',
        'ship_to_name': 'Jane Doe',
        'ship_to_address_1': '456 Oak Ave',
        'ship_to_city': 'Los Angeles',
        'ship_to_state': 'CA',
        'ship_to_zip': '90001',
        'tracking_number': 'US987654321',
        'service_name': 'Express',
        'weight_lbs': 8.2,
        'length_in': 10,
        'width_in': 6,
        'height_in': 4,
        'rate': 45.99,
        'delivery_status': 'delivered'
    }
]

INVALID_US_SHIPPING_DATA = [
    {
        # Missing required transaction
        'customer': 1,
        'ship_to_name': 'Invalid Name',
        'ship_to_address_1': '789 Error St',
        'ship_to_city': 'Chicago',
        'ship_to_state': 'IL',
        'ship_to_zip': '60601'
    },
    {
        'transaction': 1003,
        'customer': 1,
        'ship_to_name': 'A' * 300,  # Name too long (max 255 chars)
        'ship_to_address_1': '789 Error St',
        'ship_to_city': 'Chicago',
        'ship_to_state': 'IL',
        'ship_to_zip': '60601'
    },
    {
        'transaction': 1004,
        'customer': 1,
        'ship_to_name': 'Invalid Status',
        'ship_to_address_1': '789 Error St',
        'ship_to_city': 'Chicago',
        'ship_to_state': 'IL',
        'ship_to_zip': '60601',
        'delivery_status': 'invalid_status'  # Invalid choice
    },
    {
        'transaction': 1005,
        'customer': 1,
        'ship_to_name': 'Negative Weight',
        'ship_to_address_1': '789 Error St',
        'ship_to_city': 'Chicago',
        'ship_to_state': 'IL',
        'ship_to_zip': '60601',
        'weight_lbs': -5.0  # Invalid negative weight
    }
] 