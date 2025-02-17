from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase, APIClient
from decimal import Decimal
import json
from datetime import datetime, timedelta
from django.core.exceptions import ValidationError

from billing.billing_calculator import (
    validate_sku_quantity,
    BillingCalculator,
    RuleEvaluator
)
from billing.services import BillingService
from billing.config import BillingConfiguration
from orders.models import Order
from customers.models import Customer
from services.models import Service
from rules.models import Rule, RuleGroup
from customer_services.models import CustomerService

class TestSKUQuantityValidation(TestCase):
    def test_valid_sku_quantity(self):
        """Test validation of valid SKU quantity data"""
        valid_data = [
            {"sku": "ABO-072", "quantity": 10}
        ]
        self.assertTrue(validate_sku_quantity(valid_data))

        valid_data_multiple = [
            {"sku": "ABO-012", "quantity": 12},
            {"sku": "ABO-022", "quantity": 12},
            {"sku": "ABO-032", "quantity": 12},
            {"sku": "ABO-117", "quantity": 12}
        ]
        self.assertTrue(validate_sku_quantity(valid_data_multiple))

    def test_invalid_sku_quantity(self):
        """Test validation of invalid SKU quantity data"""
        # Not a list
        invalid_data = {"sku": "ABO-072", "quantity": 10}
        self.assertFalse(validate_sku_quantity(invalid_data))

        # Missing required keys
        invalid_data = [{"sku": "ABO-072"}]
        self.assertFalse(validate_sku_quantity(invalid_data))

        # Invalid quantity
        invalid_data = [{"sku": "ABO-072", "quantity": -1}]
        self.assertFalse(validate_sku_quantity(invalid_data))

        # Empty SKU
        invalid_data = [{"sku": "", "quantity": 10}]
        self.assertFalse(validate_sku_quantity(invalid_data))

class TestBillingCalculator(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Create test customer
        cls.customer = Customer.objects.create(
            company_name="Test Company",
            email="test@example.com"
        )

        # Create services
        cls.sku_cost_service = Service.objects.create(
            service_name="SKU Cost",
            charge_type="quantity"
        )
        cls.single_service = Service.objects.create(
            service_name="Single Service",
            charge_type="single"
        )
        cls.quantity_service = Service.objects.create(
            service_name="Quantity Service",
            charge_type="quantity"
        )

        # Create customer services
        cls.sku_cost_cs = CustomerService.objects.create(
            customer=cls.customer,
            service=cls.sku_cost_service,
            unit_price=Decimal("1.00")
        )
        cls.single_cs = CustomerService.objects.create(
            customer=cls.customer,
            service=cls.single_service,
            unit_price=Decimal("10.00")
        )
        cls.quantity_cs = CustomerService.objects.create(
            customer=cls.customer,
            service=cls.quantity_service,
            unit_price=Decimal("2.00")
        )

        # Create rule groups and rules
        cls.sku_cost_rule_group = RuleGroup.objects.create(
            customer_service=cls.sku_cost_cs,
            logic_operator='AND'
        )
        cls.single_rule_group = RuleGroup.objects.create(
            customer_service=cls.single_cs,
            logic_operator='AND'
        )
        cls.quantity_rule_group = RuleGroup.objects.create(
            customer_service=cls.quantity_cs,
            logic_operator='AND'
        )

        # Create rules
        Rule.objects.create(
            rule_group=cls.sku_cost_rule_group,
            field='total_item_qty',
            operator='gt',
            value='0'
        )
        Rule.objects.create(
            rule_group=cls.single_rule_group,
            field='total_item_qty',
            operator='gt',
            value='0'
        )
        Rule.objects.create(
            rule_group=cls.quantity_rule_group,
            field='total_item_qty',
            operator='gt',
            value='0'
        )

    def create_test_order(self, customer=None, services=None, transaction_id=None):
        if not customer:
            customer = self.customer
        if transaction_id is None:
            # Generate a unique transaction ID that's within PostgreSQL's integer range
            transaction_id = int(datetime.now().timestamp() * 1000000) % 2147483647
        
        order = Order.objects.create(
            customer=customer,
            transaction_id=transaction_id,
            close_date=timezone.now(),
            status='completed',
            sku_quantity=json.dumps([
                {"sku": "TEST-SKU-1", "quantity": 10},
                {"sku": "TEST-SKU-2", "quantity": 5}
            ]) if services else json.dumps([{"sku": "TEST-SKU-1", "quantity": 10}]),
            total_item_qty=15 if services and len(services) > 1 else 10
        )
        
        return order

    def test_sku_cost_calculation(self):
        """Test SKU Cost service calculation"""
        # Test single SKU
        order1 = self.create_test_order(
            services=[{"service": self.sku_cost_service, "quantity": 10}]
        )
        calculator = BillingCalculator(
            customer_id=self.customer.id,
            start_date=timezone.now(),
            end_date=timezone.now()
        )
        cost = calculator.calculate_service_cost(self.sku_cost_cs, order1)
        self.assertEqual(cost, Decimal("2.00"))  # Two unique SKUs in the test order

        # Test multiple SKUs
        order2 = self.create_test_order(
            services=[
                {"service": self.sku_cost_service, "quantity": 12},
                {"service": self.sku_cost_service, "quantity": 12},
                {"service": self.sku_cost_service, "quantity": 12},
                {"service": self.sku_cost_service, "quantity": 12}
            ]
        )
        cost = calculator.calculate_service_cost(self.sku_cost_cs, order2)
        self.assertEqual(cost, Decimal("2.00"))  # Still two unique SKUs

    def test_single_service_calculation(self):
        """Test single charge service calculation"""
        order = self.create_test_order(
            services=[{"service": self.single_service, "quantity": 10}]
        )
        calculator = BillingCalculator(
            customer_id=self.customer.id,
            start_date=timezone.now(),
            end_date=timezone.now()
        )
        cost = calculator.calculate_service_cost(self.single_cs, order)
        self.assertEqual(cost, Decimal("10.00"))

    def test_quantity_service_calculation(self):
        """Test quantity-based service calculation"""
        order = self.create_test_order(
            services=[{"service": self.quantity_service, "quantity": 10}]
        )
        calculator = BillingCalculator(
            customer_id=self.customer.id,
            start_date=timezone.now(),
            end_date=timezone.now()
        )
        cost = calculator.calculate_service_cost(self.quantity_cs, order)
        self.assertEqual(cost, Decimal("20.00"))  # $2.00 × 10 items

    def test_generate_report(self):
        """Test report generation with multiple orders and services"""
        # Create test services
        service1 = Service.objects.create(
            service_name='Report Test Service 1',
            charge_type='single',
            description='Test service 1'
        )
        service2 = Service.objects.create(
            service_name='Report Test Service 2',
            charge_type='single',
            description='Test service 2'
        )
        
        # Create customer services with prices
        cs1 = CustomerService.objects.create(
            customer=self.customer,
            service=service1,
            unit_price=Decimal('50.00')
        )
        cs2 = CustomerService.objects.create(
            customer=self.customer,
            service=service2,
            unit_price=Decimal('41.00')
        )
        
        # Create test orders
        order1 = self.create_test_order(services=[service1])
        order2 = self.create_test_order(services=[service1, service2])
        
        calculator = BillingCalculator(
            customer_id=self.customer.id,
            start_date=timezone.now() - timedelta(days=30),
            end_date=timezone.now()
        )
        report = calculator.generate_report()
        
        # Expected total: 50.00 (order1) + 91.00 (order2) = 141.00
        expected_total = Decimal('141.00')
        self.assertEqual(report.total_amount, expected_total)
        self.assertTrue('service_totals' in report.report_data)
        self.assertEqual(len(report.report_data['service_totals']), 2)

    def test_single_service_applied_once(self):
        """Test that single charge services are only applied once per order"""
        # Create a one-time service
        one_time_service = Service.objects.create(
            service_name='Single Test Service',
            charge_type='single',
            description='Test one-time service'
        )
        
        # Create customer service with price
        cs = CustomerService.objects.create(
            customer=self.customer,
            service=one_time_service,
            unit_price=Decimal('50.00')
        )
        
        # Create an order with the one-time service
        order = self.create_test_order()
        
        start_date = timezone.now() - timedelta(days=30)
        end_date = timezone.now()
        
        calculator = BillingCalculator(
            customer_id=self.customer.id,
            start_date=start_date,
            end_date=end_date
        )
        
        report = calculator.generate_report()
        
        # Count how many times the one-time service appears in the report
        service_totals = report.report_data['service_totals']
        single_service_count = sum(1 for service in service_totals 
                                 if service['service_name'] == one_time_service.service_name)
        self.assertEqual(single_service_count, 1)
        self.assertEqual(report.total_amount, Decimal('50.00'))

    def test_input_validation(self):
        """Test input validation"""
        # Test invalid customer
        with self.assertRaises(ValidationError):
            calculator = BillingCalculator(
                customer_id=99999,
                start_date=timezone.now(),
                end_date=timezone.now()
            )
            calculator.validate_input()

        # Test invalid date range
        with self.assertRaises(ValidationError):
            calculator = BillingCalculator(
                customer_id=self.customer.id,
                start_date=timezone.now(),
                end_date=timezone.now() - timezone.timedelta(days=7)
            )
            calculator.validate_input()

class TestRuleEvaluation(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Setup test data for rule evaluation
        cls.customer = Customer.objects.create(
            company_name="Test Company",
            email="test@example.com"
        )

    def test_numeric_rule_evaluation(self):
        """Test evaluation of numeric rules"""
        order = Order.objects.create(
            customer=self.customer,
            transaction_id=int(datetime.now().timestamp()),
            total_item_qty=10
        )

        rule = Rule(
            field='total_item_qty',
            operator='gt',
            value='5'
        )
        self.assertTrue(RuleEvaluator.evaluate_rule(rule, order))

        rule.operator = 'lt'
        rule.value = '20'
        self.assertTrue(RuleEvaluator.evaluate_rule(rule, order))

    def test_string_rule_evaluation(self):
        """Test evaluation of string rules"""
        order = Order.objects.create(
            customer=self.customer,
            transaction_id=int(datetime.now().timestamp()),
            carrier="UPS"
        )

        rule = Rule(
            field='carrier',
            operator='eq',
            value='UPS'
        )
        self.assertTrue(RuleEvaluator.evaluate_rule(rule, order))

        rule.operator = 'contains'
        rule.value = 'UP'
        self.assertTrue(RuleEvaluator.evaluate_rule(rule, order))

    def test_sku_quantity_rule_evaluation(self):
        """Test evaluation of SKU quantity rules"""
        order = Order.objects.create(
            customer=self.customer,
            transaction_id=int(datetime.now().timestamp()),
            sku_quantity=json.dumps([
                {"sku": "ABO-012", "quantity": 12},
                {"sku": "ABO-022", "quantity": 12}
            ])
        )

        rule = Rule(
            field='sku_quantity',
            operator='contains',
            value='ABO-012'
        )
        self.assertTrue(RuleEvaluator.evaluate_rule(rule, order))

        rule.operator = 'ncontains'
        rule.value = 'ABO-999'
        self.assertTrue(RuleEvaluator.evaluate_rule(rule, order))

class TestBillingAPI(APITestCase):
    @classmethod
    def setUpTestData(cls):
        # Create test user
        User = get_user_model()
        cls.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )

        # Create test customer
        cls.customer = Customer.objects.create(
            company_name="Test Company",
            email="test@example.com"
        )

    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def create_test_order(self, customer=None, services=None, transaction_id=None):
        if not customer:
            customer = self.customer
        if transaction_id is None:
            # Generate a unique transaction ID that's within PostgreSQL's integer range
            transaction_id = int(datetime.now().timestamp() * 1000000) % 2147483647
        
        order = Order.objects.create(
            customer=customer,
            transaction_id=transaction_id,
            close_date=timezone.now(),
            status='completed',
            sku_quantity=json.dumps([
                {"sku": "TEST-SKU-1", "quantity": 10},
                {"sku": "TEST-SKU-2", "quantity": 5}
            ]) if services else json.dumps([{"sku": "TEST-SKU-1", "quantity": 10}]),
            total_item_qty=15 if services and len(services) > 1 else 10
        )
        
        return order

    def test_generate_report_success(self):
        """Test successful report generation"""
        # Create test service
        service = Service.objects.create(
            service_name='Success Test Service',
            charge_type='single',
            description='Test service'
        )
        
        # Create customer service with price
        cs = CustomerService.objects.create(
            customer=self.customer,
            service=service,
            unit_price=Decimal('50.00')
        )
        
        # Create test order
        order = self.create_test_order(services=[service])

        url = reverse('billing:generate_report')
        data = {
            'customer_id': self.customer.id,
            'start_date': (timezone.now() - timezone.timedelta(days=7)).isoformat(),
            'end_date': timezone.now().isoformat(),
            'output_format': 'json'
        }

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('report', response.data)
        self.assertIn('total_amount', response.data['report'])
        self.assertIn('order_costs', response.data['report'])
        self.assertIn('service_totals', response.data['report'])

    def test_generate_report_missing_params(self):
        """Test report generation with missing parameters"""
        url = reverse('billing:generate_report')
        
        # Test missing customer_id
        data = {
            'start_date': timezone.now().isoformat(),
            'end_date': timezone.now().isoformat()
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)
        self.assertIn('customer_id', response.data['error'])

        # Test missing start_date
        data = {
            'customer_id': self.customer.id,
            'end_date': timezone.now().isoformat()
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)
        self.assertIn('start_date', response.data['error'])

        # Test missing end_date
        data = {
            'customer_id': self.customer.id,
            'start_date': timezone.now().isoformat()
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)
        self.assertIn('end_date', response.data['error'])

    def test_generate_report_invalid_customer(self):
        """Test report generation with invalid customer ID"""
        url = reverse('billing:generate_report')
        data = {
            'customer_id': 99999,  # Non-existent customer ID
            'start_date': timezone.now().isoformat(),
            'end_date': timezone.now().isoformat()
        }

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 500)
        self.assertIn('error', response.data)

    def test_generate_report_invalid_dates(self):
        """Test report generation with invalid date range"""
        url = reverse('billing:generate_report')
        data = {
            'customer_id': self.customer.id,
            'start_date': timezone.now().isoformat(),
            'end_date': (timezone.now() - timezone.timedelta(days=7)).isoformat()  # End date before start date
        }

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 500)
        self.assertIn('error', response.data)

    def test_generate_report_authentication(self):
        """Test report generation authentication requirements"""
        self.client.logout()
        url = reverse('billing:generate_report')
        data = {
            'customer_id': self.customer.id,
            'start_date': timezone.now().isoformat(),
            'end_date': timezone.now().isoformat()
        }

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 403)  # Unauthorized

    def test_generate_report_export_formats(self):
        """Test report generation in different formats"""
        # Create test data
        service = Service.objects.create(
            service_name='Export Test Service',
            charge_type='single',
            description='Test service'
        )
        
        # Create customer service with price
        cs = CustomerService.objects.create(
            customer=self.customer,
            service=service,
            unit_price=Decimal('50.00')
        )
        
        order = self.create_test_order()

        # Test Excel format
        response = self.client.post(
            reverse('billing:generate_report'),
            {
                'customer_id': self.customer.id,
                'start_date': (timezone.now() - timedelta(days=30)).strftime('%Y-%m-%d'),
                'end_date': timezone.now().strftime('%Y-%m-%d'),
                'output_format': 'excel'
            },
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

        # Test PDF format
        response = self.client.post(
            reverse('billing:generate_report'),
            {
                'customer_id': self.customer.id,
                'start_date': (timezone.now() - timedelta(days=30)).strftime('%Y-%m-%d'),
                'end_date': timezone.now().strftime('%Y-%m-%d'),
                'output_format': 'pdf'
            },
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')

class TestBillingService(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Create test customer
        cls.customer = Customer.objects.create(
            company_name="Test Company",
            email="test@example.com"
        )

        # Create services with specific names to match configuration
        cls.sku_cost_service = Service.objects.create(
            service_name="SKU Cost",
            charge_type="quantity"
        )
        cls.single_service = Service.objects.create(
            service_name="Single Service",
            charge_type="single"
        )
        cls.quantity_service = Service.objects.create(
            service_name="Quantity Service",
            charge_type="quantity"
        )

        # Create customer services
        cls.sku_cost_cs = CustomerService.objects.create(
            customer=cls.customer,
            service=cls.sku_cost_service,
            unit_price=Decimal("1.00")
        )
        cls.single_cs = CustomerService.objects.create(
            customer=cls.customer,
            service=cls.single_service,
            unit_price=Decimal("10.00")
        )
        cls.quantity_cs = CustomerService.objects.create(
            customer=cls.customer,
            service=cls.quantity_service,
            unit_price=Decimal("2.00")
        )

    def create_test_order(self, customer=None, sku_data=None):
        if not customer:
            customer = self.customer
            
        if not sku_data:
            sku_data = [
                {"sku": "TEST-SKU-1", "quantity": 10},
                {"sku": "TEST-SKU-2", "quantity": 5}
            ]
            
        return Order.objects.create(
            customer=customer,
            transaction_id=int(datetime.now().timestamp() * 1000000) % 2147483647,
            close_date=timezone.now(),
            status='completed',
            sku_quantity=json.dumps(sku_data),
            total_item_qty=sum(item['quantity'] for item in sku_data)
        )

    def test_sku_cost_calculation(self):
        """Test SKU Cost service calculation with configuration"""
        order = self.create_test_order()
        calculator = BillingCalculator(
            customer_id=self.customer.id,
            start_date=timezone.now(),
            end_date=timezone.now()
        )
        service = BillingService(calculator)
        
        cost = service.calculate_service_cost(self.sku_cost_cs, order)
        self.assertEqual(cost, Decimal("2.00"))  # Two unique SKUs

    def test_single_service_calculation(self):
        """Test single charge service calculation with configuration"""
        order = self.create_test_order()
        calculator = BillingCalculator(
            customer_id=self.customer.id,
            start_date=timezone.now(),
            end_date=timezone.now()
        )
        service = BillingService(calculator)
        
        cost = service.calculate_service_cost(self.single_cs, order)
        self.assertEqual(cost, Decimal("10.00"))

    def test_quantity_service_calculation(self):
        """Test quantity-based service calculation with configuration"""
        order = self.create_test_order()
        calculator = BillingCalculator(
            customer_id=self.customer.id,
            start_date=timezone.now(),
            end_date=timezone.now()
        )
        service = BillingService(calculator)
        
        cost = service.calculate_service_cost(self.quantity_cs, order)
        self.assertEqual(cost, Decimal("30.00"))  # 15 total items * $2.00

    def test_service_total_formatting(self):
        """Test service total formatting with configuration"""
        calculator = BillingCalculator(
            customer_id=self.customer.id,
            start_date=timezone.now(),
            end_date=timezone.now()
        )
        service = BillingService(calculator)
        
        # Create test service totals
        service_totals = {
            1: {
                'service_name': 'Test Service',
                'total_amount': Decimal('100.00')
            }
        }
        
        formatted_totals = service.format_service_totals(service_totals)
        self.assertIn(1, formatted_totals)
        self.assertEqual(formatted_totals[1]['total_amount'], Decimal('100.00'))
        self.assertEqual(formatted_totals[1]['service_name'], 'Test Service')