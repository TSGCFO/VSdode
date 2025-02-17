from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse, HttpResponse
from django.core.exceptions import ValidationError
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from datetime import datetime
from .forms import BillingReportForm
from .billing_calculator import BillingCalculator, generate_excel_report, generate_pdf_report
from .services import BillingService
import logging
from dateutil import parser

logger = logging.getLogger(__name__)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class BillingReportView(TemplateView):
    template_name = 'billing/billing_report.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form'] = BillingReportForm()
        return context

class GenerateReportAPIView(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            logger.info(f"Received data: {request.data}")

            customer_id = request.data.get('customer_id')
            start_date = request.data.get('start_date')
            end_date = request.data.get('end_date')
            output_format = request.data.get('output_format', 'json').lower()

            if not all([customer_id, start_date, end_date]):
                missing_params = []
                if not customer_id: missing_params.append('customer_id')
                if not start_date: missing_params.append('start_date')
                if not end_date: missing_params.append('end_date')
                error_msg = f"Missing required parameters: {', '.join(missing_params)}"
                logger.error(error_msg)
                return Response(
                    {"error": error_msg},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                customer_id = int(customer_id)
            except (TypeError, ValueError):
                error_msg = f"Invalid customer_id format: {customer_id}"
                logger.error(error_msg)
                return Response(
                    {"error": error_msg},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                # Parse dates if they're strings
                if isinstance(start_date, str):
                    # Handle multiple date formats
                    try:
                        # Try ISO format first
                        start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                    except ValueError:
                        try:
                            # Try common date formats
                            start_date = parser.parse(start_date)
                        except ValueError:
                            raise ValidationError(f"Invalid start_date format: {start_date}")

                if isinstance(end_date, str):
                    try:
                        end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                    except ValueError:
                        try:
                            # Try common date formats
                            end_date = parser.parse(end_date)
                        except ValueError:
                            raise ValidationError(f"Invalid end_date format: {end_date}")

                # Create calculator and service
                calculator = BillingCalculator(
                    customer_id=customer_id,
                    start_date=start_date,
                    end_date=end_date
                )
                service = BillingService(calculator)
                
                # Generate report using service
                report_data = service.generate_report()
                
                # Update the calculator's report with the formatted data
                calculator.report.report_data = report_data
                
                logger.info("Report generated successfully")

                if output_format == 'excel':
                    # Generate Excel report
                    excel_data = generate_excel_report(calculator.report)
                    response = HttpResponse(
                        excel_data,
                        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    )
                    response['Content-Disposition'] = 'attachment; filename="billing_report.xlsx"'
                    return response
                    
                elif output_format == 'pdf':
                    # Generate PDF report
                    pdf_data = generate_pdf_report(calculator.report)
                    response = HttpResponse(pdf_data, content_type='application/pdf')
                    response['Content-Disposition'] = 'attachment; filename="billing_report.pdf"'
                    return response
                    
                else:
                    # Return JSON format (default)
                    return Response({
                        'success': True,
                        'report': report_data
                    })

            except ValidationError as e:
                error_msg = str(e)
                logger.error(f"Validation error: {error_msg}")
                return Response(
                    {"error": error_msg},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                error_msg = f"Error generating report: {str(e)}"
                logger.error(error_msg)
                return Response(
                    {"error": error_msg},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(error_msg)
            return Response(
                {"error": error_msg},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )