from rest_framework import serializers
from decimal import Decimal
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer for Product model providing CRUD operations.
    Includes calculated fields and validation.
    """
    is_in_stock = serializers.BooleanField(read_only=True)
    profit_margin = serializers.FloatField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'sku', 'description', 'price', 'cost',
            'stock_quantity', 'category', 'is_active', 'is_in_stock',
            'profit_margin', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_sku(self, value):
        """
        Validate that the SKU is unique (case-insensitive).
        """
        value = value.upper()
        if self.instance is None:  # Creating new product
            if Product.objects.filter(sku__iexact=value).exists():
                raise serializers.ValidationError(
                    "A product with this SKU already exists."
                )
        else:  # Updating existing product
            if Product.objects.filter(
                sku__iexact=value
            ).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError(
                    "A product with this SKU already exists."
                )
        return value

    def validate_price(self, value):
        """
        Validate that the price is positive.
        """
        if value <= Decimal('0'):
            raise serializers.ValidationError(
                "Price must be greater than zero."
            )
        return value

    def validate_cost(self, value):
        """
        Validate that the cost is non-negative if provided.
        """
        if value is not None and value < Decimal('0'):
            raise serializers.ValidationError(
                "Cost cannot be negative."
            )
        return value

    def validate(self, data):
        """
        Cross-field validation.
        """
        # Ensure cost is not greater than price if both are provided
        price = data.get('price')
        cost = data.get('cost')
        if price and cost and cost > price:
            raise serializers.ValidationError({
                'cost': "Cost cannot be greater than price."
            })

        # Ensure stock quantity is non-negative
        stock_quantity = data.get('stock_quantity')
        if stock_quantity is not None and stock_quantity < 0:
            raise serializers.ValidationError({
                'stock_quantity': "Stock quantity cannot be negative."
            })

        return data