from django import forms
from django.core.exceptions import ValidationError
from datetime import datetime, timedelta
from customers.models import Customer
from customer_services.models import CustomerService

class BillingReportForm(forms.Form):
    customer = forms.ModelChoiceField(
        queryset=Customer.objects.all(),
        empty_label="Select Customer",
        widget=forms.Select(attrs={
            'class': 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500',
            'required': True
        })
    )
    start_date = forms.DateField(
        widget=forms.DateInput(attrs={
            'type': 'date',
            'class': 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500',
            'required': True
        })
    )
    end_date = forms.DateField(
        widget=forms.DateInput(attrs={
            'type': 'date',
            'class': 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500',
            'required': True
        })
    )
    output_format = forms.ChoiceField(
        choices=[
            ('json', 'JSON'),
            ('excel', 'Excel'),
            ('pdf', 'PDF')
        ],
        initial='json',
        widget=forms.Select(attrs={
            'class': 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
        })
    )

    def clean(self):
        cleaned_data = super().clean()
        start_date = cleaned_data.get('start_date')
        end_date = cleaned_data.get('end_date')
        customer = cleaned_data.get('customer')

        if start_date and end_date:
            # Validate date range
            if start_date > end_date:
                raise ValidationError("Start date must be before end date")

            # Validate maximum date range (e.g., 1 year)
            max_range = timedelta(days=365)
            if end_date - start_date > max_range:
                raise ValidationError("Date range cannot exceed 1 year")

        if customer:
            # Validate customer has services
            if not CustomerService.objects.filter(customer=customer).exists():
                raise ValidationError("Selected customer has no services configured")

        return cleaned_data
    
