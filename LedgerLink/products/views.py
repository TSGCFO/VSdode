from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling product CRUD operations.
    Provides standard CRUD endpoints plus additional actions.
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_queryset(self):
        """
        Optionally filter queryset based on various parameters.
        """
        queryset = super().get_queryset()
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)

        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            is_active = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active)

        # Filter by stock status
        in_stock = self.request.query_params.get('in_stock', None)
        if in_stock is not None:
            in_stock = in_stock.lower() == 'true'
            if in_stock:
                queryset = queryset.filter(stock_quantity__gt=0)
            else:
                queryset = queryset.filter(stock_quantity=0)

        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(sku__icontains=search) |
                Q(description__icontains=search)
            )

        # Price range filtering
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        return queryset.order_by('name')

    def list(self, request, *args, **kwargs):
        """
        List products with optional filtering.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })

    def create(self, request, *args, **kwargs):
        """
        Create a new product.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            'success': True,
            'message': 'Product created successfully',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """
        Update an existing product.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({
            'success': True,
            'message': 'Product updated successfully',
            'data': serializer.data
        })

    def destroy(self, request, *args, **kwargs):
        """
        Delete a product.
        """
        instance = self.get_object()
        # Check if product is being used in any orders
        if instance.customerservice_set.exists():
            return Response({
                'success': False,
                'message': 'Cannot delete product as it is used in customer services'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        self.perform_destroy(instance)
        return Response({
            'success': True,
            'message': 'Product deleted successfully'
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        """
        Update product stock quantity.
        Expects quantity and operation ('add' or 'subtract') in request data.
        """
        instance = self.get_object()
        quantity = request.data.get('quantity')
        operation = request.data.get('operation', 'add')

        if not quantity or not isinstance(quantity, (int, float)) or quantity <= 0:
            return Response({
                'success': False,
                'message': 'Invalid quantity'
            }, status=status.HTTP_400_BAD_REQUEST)

        if operation not in ['add', 'subtract']:
            return Response({
                'success': False,
                'message': 'Invalid operation'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            instance.update_stock(quantity, operation)
            serializer = self.get_serializer(instance)
            return Response({
                'success': True,
                'message': f'Stock {operation}ed successfully',
                'data': serializer.data
            })
        except ValueError as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """
        Get list of unique product categories.
        """
        categories = Product.objects.values_list(
            'category', flat=True
        ).distinct().order_by('category')
        return Response({
            'success': True,
            'data': list(categories)
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get product statistics.
        """
        total_products = self.get_queryset().count()
        active_products = self.get_queryset().filter(is_active=True).count()
        out_of_stock = self.get_queryset().filter(stock_quantity=0).count()
        
        return Response({
            'success': True,
            'data': {
                'total_products': total_products,
                'active_products': active_products,
                'out_of_stock': out_of_stock
            }
        })