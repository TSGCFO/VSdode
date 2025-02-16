from django.test import TestCase
import pandas as pd
from .services.template_generator import ExcelTemplateGenerator
from .services.validators import BulkImportValidator

# Test Data
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

class TemplateValidationTests(TestCase):
    def setUp(self):
        """Set up test environment"""
        self.template_types = [
            'customers', 'products', 'services', 'materials',
            'inserts', 'us_shipping', 'cad_shipping'
        ]
        self.test_data_map = {
            'customers': (VALID_CUSTOMERS_DATA, INVALID_CUSTOMERS_DATA),
            'products': (VALID_PRODUCTS_DATA, INVALID_PRODUCTS_DATA),
            'services': (VALID_SERVICES_DATA, INVALID_SERVICES_DATA),
            'materials': (VALID_MATERIALS_DATA, INVALID_MATERIALS_DATA),
            'inserts': (VALID_INSERTS_DATA, INVALID_INSERTS_DATA),
            'us_shipping': (VALID_US_SHIPPING_DATA, INVALID_US_SHIPPING_DATA),
            'cad_shipping': (VALID_CAD_SHIPPING_DATA, INVALID_CAD_SHIPPING_DATA)
        }

    def test_template_definitions(self):
        """Test that all template definitions are properly configured"""
        for template_type in self.template_types:
            template_def = ExcelTemplateGenerator.get_template_definition(template_type)
            self.assertIsNotNone(template_def)
            self.assertIn('fields', template_def)
            self.assertIn('required_fields', template_def)
            self.assertTrue(len(template_def['fields']) > 0)

    def test_field_types(self):
        """Test that all field types are properly defined"""
        for template_type in self.template_types:
            field_types = ExcelTemplateGenerator.get_field_types(template_type)
            self.assertIsNotNone(field_types)
            for field, info in field_types.items():
                self.assertIn('type', info)
                if info.get('required'):
                    self.assertIn(field, ExcelTemplateGenerator.get_template_definition(template_type)['required_fields'])

    def test_valid_data_validation(self):
        """Test validation of valid data for all templates"""
        for template_type, (valid_data, _) in self.test_data_map.items():
            df = pd.DataFrame(valid_data)
            validator = BulkImportValidator(template_type, df)
            self.assertTrue(
                validator.validate(),
                f"Validation failed for valid {template_type} data: {validator.errors}"
            )
            self.assertEqual(len(validator.errors), 0)

    def test_invalid_data_validation(self):
        """Test validation of invalid data for all templates"""
        for template_type, (_, invalid_data) in self.test_data_map.items():
            df = pd.DataFrame(invalid_data)
            validator = BulkImportValidator(template_type, df)
            self.assertFalse(
                validator.validate(),
                f"Validation unexpectedly passed for invalid {template_type} data"
            )
            self.assertTrue(len(validator.errors) > 0)

    def test_required_fields_validation(self):
        """Test validation of required fields for all templates"""
        for template_type in self.template_types:
            template_def = ExcelTemplateGenerator.get_template_definition(template_type)
            required_fields = template_def['required_fields']
            
            # Create data missing each required field
            for field in required_fields:
                valid_data = self.test_data_map[template_type][0][0].copy()
                del valid_data[field]
                df = pd.DataFrame([valid_data])
                validator = BulkImportValidator(template_type, df)
                self.assertFalse(
                    validator.validate(),
                    f"Validation unexpectedly passed for {template_type} with missing required field {field}"
                )

    def test_field_type_validation(self):
        """Test validation of field types for all templates"""
        for template_type in self.template_types:
            field_types = ExcelTemplateGenerator.get_field_types(template_type)
            valid_data = self.test_data_map[template_type][0][0].copy()

            for field, info in field_types.items():
                if field not in valid_data:
                    continue

                # Test invalid type for each field
                invalid_data = valid_data.copy()
                if info['type'] == 'integer':
                    invalid_data[field] = 'not_an_integer'
                elif info['type'] == 'decimal':
                    invalid_data[field] = 'not_a_decimal'
                elif info['type'] == 'choice' and info.get('choices'):
                    invalid_data[field] = 'invalid_choice'
                elif info['type'] == 'string':
                    invalid_data[field] = 123  # Non-string value
                elif info['type'] == 'email':
                    invalid_data[field] = 'not_an_email'

                df = pd.DataFrame([invalid_data])
                print(f"\nTesting {template_type} - {field} ({info['type']}):")
                print(f"Value: {df[field].iloc[0]}")
                print(f"Type: {type(df[field].iloc[0])}")
                validator = BulkImportValidator(template_type, df)
                self.assertFalse(
                    validator.validate(),
                    f"Validation unexpectedly passed for {template_type} with invalid type for field {field}"
                )

    def test_max_length_validation(self):
        """Test validation of max length constraints"""
        for template_type in self.template_types:
            field_types = ExcelTemplateGenerator.get_field_types(template_type)
            valid_data = self.test_data_map[template_type][0][0].copy()

            for field, info in field_types.items():
                if field not in valid_data or info['type'] != 'string' or not info.get('max_length'):
                    continue

                # Test string longer than max_length
                invalid_data = valid_data.copy()
                invalid_data[field] = 'A' * (info['max_length'] + 1)
                df = pd.DataFrame([invalid_data])
                validator = BulkImportValidator(template_type, df)
                self.assertFalse(
                    validator.validate(),
                    f"Validation unexpectedly passed for {template_type} with too long value for field {field}"
                )
