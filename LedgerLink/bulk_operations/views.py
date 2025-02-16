# bulk_operations/views.py
from rest_framework import viewsets, views, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse
from django.db import transaction
from django.utils import timezone
import pandas as pd
import logging
from .services.template_generator import ExcelTemplateGenerator
from .serializers import BulkSerializerFactory, BulkImportResponseSerializer
from .models import BulkImportLog
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
import io

logger = logging.getLogger(__name__)


class BulkOperationViewSet(viewsets.ViewSet):
    """
    ViewSet for bulk operations management.
    """

    def list(self, request):
        """
        List all available templates and their metadata.
        """
        try:
            templates = [
                {
                    'type': 'customers',
                    'name': 'Customers',
                    'description': 'Import customer records',
                    'sample_data': True,
                    'validation_enabled': True,
                },
                {
                    'type': 'orders',
                    'name': 'Orders',
                    'description': 'Import order records',
                    'sample_data': True,
                    'validation_enabled': True,
                },
                {
                    'type': 'products',
                    'name': 'Products',
                    'description': 'Import product records',
                    'sample_data': True,
                    'validation_enabled': True,
                },
                {
                    'type': 'services',
                    'name': 'Services',
                    'description': 'Import service records',
                    'sample_data': True,
                    'validation_enabled': True,
                },
                {
                    'type': 'materials',
                    'name': 'Materials',
                    'description': 'Import material records',
                    'sample_data': True,
                    'validation_enabled': True,
                },
                {
                    'type': 'inserts',
                    'name': 'Inserts',
                    'description': 'Import insert records',
                    'sample_data': True,
                    'validation_enabled': True,
                },
                {
                    'type': 'cad_shipping',
                    'name': 'CAD Shipping',
                    'description': 'Import Canadian shipping records',
                    'sample_data': True,
                    'validation_enabled': True,
                },
                {
                    'type': 'us_shipping',
                    'name': 'US Shipping',
                    'description': 'Import US shipping records',
                    'sample_data': True,
                    'validation_enabled': True,
                }
            ]
            
            return Response({
                'success': True,
                'data': {
                    'templates': templates,
                    'supportedFormats': ['xlsx'],
                    'maxFileSize': 10 * 1024 * 1024,  # 10MB
                    'features': {
                        'dataValidation': True,
                        'sampleData': True,
                        'tooltips': True,
                        'instructions': True,
                    }
                }
            })
        except Exception as e:
            logger.error(f"Error in list templates: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to retrieve templates'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='template-info/(?P<template_type>[^/.]+)')
    def template_info(self, request, template_type):
        """
        Get detailed information about a specific template.
        """
        try:
            template_def = ExcelTemplateGenerator.get_template_definition(template_type)
            field_types = ExcelTemplateGenerator.get_field_types(template_type)

            return Response({
                'success': True,
                'data': {
                    'templateType': template_type,
                    'fields': template_def['fields'],
                    'requiredFields': template_def['required_fields'],
                    'fieldTypes': field_types,
                    'features': {
                        'dataValidation': True,
                        'sampleData': True,
                        'tooltips': True,
                        'instructions': True,
                    },
                    'validationRules': {
                        field: {
                            'type': info['type'],
                            'required': info.get('required', False),
                            'description': info.get('description', ''),
                            'validation': self._get_validation_info(info)
                        }
                        for field, info in field_types.items()
                    }
                }
            })
        except KeyError:
            return Response({
                'success': False,
                'error': f"Template type '{template_type}' not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error in template info: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to retrieve template information'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @staticmethod
    def _get_validation_info(field_info):
        """Get validation information for a field."""
        validation = {}
        
        if field_info['type'] == 'choice':
            validation['type'] = 'list'
            validation['choices'] = [choice[0] for choice in field_info.get('choices', [])]
            if field_info.get('default'):
                validation['default'] = field_info['default']
        
        elif field_info['type'] in ('integer', 'decimal'):
            validation['type'] = field_info['type']
            validation['min'] = 0
        
        elif field_info['type'] == 'email':
            validation['type'] = 'email'
            validation['pattern'] = 'email format'
        
        elif field_info.get('max_length'):
            validation['maxLength'] = field_info['max_length']
        
        return validation


class TemplateDownloadView(views.APIView):
    """
    API endpoint for template downloads.
    """

    def get(self, request, template_type):
        try:
            # Generate Excel template
            wb = ExcelTemplateGenerator.generate_excel_template(template_type)
            
            # Save to buffer
            buffer = io.BytesIO()
            wb.save(buffer)
            buffer.seek(0)
            
            # Create the response
            response = HttpResponse(
                buffer.getvalue(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = f'attachment; filename="{template_type}_template.xlsx"'
            
            return response

        except KeyError:
            return Response({
                'success': False,
                'error': f"Template type '{template_type}' not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error in template download: {str(e)}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BulkImportView(views.APIView):
    """
    API endpoint for bulk imports.
    """
    parser_classes = (MultiPartParser, FormParser)
    BATCH_SIZE = 100  # Process records in batches of 100

    def post(self, request, template_type):
        import_log = None
        try:
            if 'file' not in request.FILES:
                return Response({
                    'success': False,
                    'error': 'No file provided'
                }, status=status.HTTP_400_BAD_REQUEST)

            file = request.FILES['file']

            # Create import log entry
            import_log = BulkImportLog.objects.create(
                template_type=template_type,
                file_name=file.name,
                file_size=file.size,
                total_rows=0,  # Will be updated after reading file
                user=request.user if request.user.is_authenticated else None,
                ip_address=request.META.get('REMOTE_ADDR')
            )

            # Validate file size and type
            if file.size > 10 * 1024 * 1024:  # 10MB limit
                import_log.status = 'failed'
                import_log.errors = {'error': 'File size exceeds 10MB limit'}
                import_log.completed_at = timezone.now()
                import_log.save()
                return Response({
                    'success': False,
                    'error': 'File size exceeds 10MB limit'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Read and validate file
            try:
                if not file.name.endswith(('.xlsx')):
                    import_log.status = 'failed'
                    import_log.errors = {'error': 'Unsupported file format'}
                    import_log.completed_at = timezone.now()
                    import_log.save()
                    return Response({
                        'success': False,
                        'error': 'Please use the Excel template provided (.xlsx format)'
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Read Excel file
                df = pd.read_excel(file, sheet_name='Template')
                
                # Validate template structure
                template_def = ExcelTemplateGenerator.get_template_definition(template_type)
                expected_fields = template_def['fields']
                
                # Add logging to debug column names
                logger.info(f"Expected fields: {expected_fields}")
                logger.info(f"Found columns: {list(df.columns)}")
                
                # Clean up column names - strip whitespace and remove asterisks
                df.columns = [col.strip().rstrip('*').strip() for col in df.columns]
                
                logger.info(f"Cleaned columns: {list(df.columns)}")
                
                if not all(field in df.columns for field in expected_fields):
                    missing_fields = [field for field in expected_fields if field not in df.columns]
                    logger.error(f"Missing fields: {missing_fields}")
                    import_log.status = 'failed'
                    import_log.errors = {
                        'error': 'Invalid template structure',
                        'details': f'Missing columns: {", ".join(missing_fields)}'
                    }
                    import_log.completed_at = timezone.now()
                    import_log.save()
                    return Response({
                        'success': False,
                        'error': 'Invalid template structure. Please use the provided template.',
                        'details': f'Missing columns: {", ".join(missing_fields)}'
                    }, status=status.HTTP_400_BAD_REQUEST)

            except Exception as e:
                import_log.status = 'failed'
                import_log.errors = {'error': f'Error reading file: {str(e)}'}
                import_log.completed_at = timezone.now()
                import_log.save()
                return Response({
                    'success': False,
                    'error': f'Error reading file: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Update total rows in import log
            import_log.total_rows = len(df)
            import_log.save()

            # Validate row count
            if len(df) > 1000:  # Maximum 1000 rows
                import_log.status = 'failed'
                import_log.errors = {'error': 'File exceeds maximum row limit of 1000 rows'}
                import_log.completed_at = timezone.now()
                import_log.save()
                return Response({
                    'success': False,
                    'error': 'File exceeds maximum row limit of 1000 rows'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get appropriate serializer
            serializer_class = BulkSerializerFactory.get_serializer(template_type)
            
            # Pre-validate all records
            import_log.status = 'validating'
            import_log.save()
            
            validation_errors = []
            valid_records = []
            
            for index, row in df.iterrows():
                try:
                    data = row.to_dict()
                    # Clean up NaN values
                    data = {k: ('' if pd.isna(v) else v) for k, v in data.items()}
                    serializer = serializer_class(data=data)
                    if serializer.is_valid():
                        valid_records.append(serializer)
                    else:
                        validation_errors.append({
                            'row': index + 2,  # +2 for header row and 1-based indexing
                            'errors': serializer.errors
                        })
                except Exception as e:
                    validation_errors.append({
                        'row': index + 2,
                        'errors': str(e)
                    })

            # If there are validation errors, return them without processing
            if validation_errors:
                import_log.status = 'failed'
                import_log.errors = {'validation_errors': validation_errors}
                import_log.completed_at = timezone.now()
                import_log.save()
                return Response({
                    'success': False,
                    'message': 'Validation failed',
                    'validation_errors': validation_errors
                }, status=status.HTTP_400_BAD_REQUEST)

            # Process valid records in batches
            import_log.status = 'processing'
            import_log.save()
            
            successful_records = 0
            processing_errors = []
            
            try:
                with transaction.atomic():
                    for i in range(0, len(valid_records), self.BATCH_SIZE):
                        batch = valid_records[i:i + self.BATCH_SIZE]
                        batch_objects = []
                        
                        for serializer in batch:
                            try:
                                obj = serializer.save()
                                batch_objects.append(obj)
                                successful_records += 1
                                # Update import log periodically
                                if successful_records % self.BATCH_SIZE == 0:
                                    import_log.successful_rows = successful_records
                                    import_log.save()
                            except Exception as e:
                                processing_errors.append({
                                    'row': i + 2,
                                    'errors': str(e)
                                })
                                raise  # Rollback the transaction

            except Exception as e:
                logger.error(f"Bulk import failed: {str(e)}")
                import_log.status = 'failed'
                import_log.errors = {
                    'error': str(e),
                    'processing_errors': processing_errors
                }
                import_log.completed_at = timezone.now()
                import_log.save()
                return Response({
                    'success': False,
                    'message': 'Import failed',
                    'error': str(e),
                    'processing_errors': processing_errors
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Prepare response
            success = len(processing_errors) == 0
            
            # Update import log with final status
            import_log.successful_rows = successful_records
            import_log.failed_rows = len(processing_errors)
            import_log.status = 'completed' if success else 'partially_completed'
            import_log.completed_at = timezone.now()
            if processing_errors:
                import_log.errors = {'processing_errors': processing_errors}
            import_log.save()

            response_data = {
                'success': success,
                'message': 'Import completed',
                'import_summary': {
                    'total_rows': len(df),
                    'successful': successful_records,
                    'failed': len(processing_errors)
                }
            }

            if processing_errors:
                response_data['processing_errors'] = processing_errors

            response_status = status.HTTP_200_OK if success else status.HTTP_207_MULTI_STATUS
            return Response(response_data, status=response_status)

        except Exception as e:
            logger.error(f"Error in bulk import: {str(e)}")
            if import_log:
                import_log.status = 'failed'
                import_log.errors = {'error': str(e)}
                import_log.completed_at = timezone.now()
                import_log.save()
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ImportHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing bulk import history.
    """
    permission_classes = [IsAuthenticated]
    queryset = BulkImportLog.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['template_type', 'status', 'user']
    search_fields = ['file_name', 'template_type']
    ordering_fields = ['started_at', 'completed_at', 'total_rows', 'successful_rows', 'failed_rows']
    ordering = ['-started_at']

    def get_queryset(self):
        """
        Filter queryset based on user permissions.
        Regular users can only see their own imports.
        Staff users can see all imports.
        """
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        return queryset

    def get_serializer_class(self):
        """
        Return appropriate serializer class.
        """
        if self.action == 'list':
            return BulkImportListSerializer
        return BulkImportDetailSerializer