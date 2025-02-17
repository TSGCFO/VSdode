import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import BillingReport from '../BillingReport';
import { billingApi } from '../../../utils/apiClient';

// Mock the API client
jest.mock('../../../utils/apiClient', () => ({
  billingApi: {
    generateReport: jest.fn(),
  },
}));

const mockReport = {
  total_amount: 1000.00,
  start_date: '2024-01-01',
  end_date: '2024-01-31',
  orders: [
    {
      order_id: 'ORDER-001',
      services: [
        { service_id: 1, service_name: 'Service 1', amount: 500.00 },
        { service_id: 2, service_name: 'Service 2', amount: 500.00 },
      ],
      total_amount: 1000.00,
    },
  ],
  service_totals: {
    1: { name: 'Service 1', amount: 500.00 },
    2: { name: 'Service 2', amount: 500.00 },
  },
};

const renderWithProvider = (component) => {
  return render(
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {component}
    </LocalizationProvider>
  );
};

describe('BillingReport Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProvider(<BillingReport />);
    expect(screen.getByText('Billing Report')).toBeInTheDocument();
  });

  it('shows loading state when generating report', async () => {
    billingApi.generateReport.mockImplementation(() => 
      new Promise((resolve) => setTimeout(() => resolve({ success: true, data: mockReport }), 100))
    );

    renderWithProvider(<BillingReport />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/customer/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2024-01-31' } });
    
    // Submit the form
    fireEvent.click(screen.getByText(/generate report/i));
    
    // Check loading state
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('displays report data after successful generation', async () => {
    billingApi.generateReport.mockResolvedValue({ success: true, data: mockReport });

    renderWithProvider(<BillingReport />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/customer/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2024-01-31' } });
    
    // Submit the form
    fireEvent.click(screen.getByText(/generate report/i));
    
    // Wait for report data to be displayed
    await waitFor(() => {
      expect(screen.getByText('$1,000.00')).toBeInTheDocument();
      expect(screen.getByText('Service 1')).toBeInTheDocument();
      expect(screen.getByText('Service 2')).toBeInTheDocument();
      expect(screen.getByText('ORDER-001')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const errorMessage = 'Failed to generate report';
    billingApi.generateReport.mockRejectedValue(new Error(errorMessage));

    renderWithProvider(<BillingReport />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/customer/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2024-01-31' } });
    
    // Submit the form
    fireEvent.click(screen.getByText(/generate report/i));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('validates required fields before submission', async () => {
    renderWithProvider(<BillingReport />);
    
    // Submit form without filling in required fields
    fireEvent.click(screen.getByText(/generate report/i));
    
    // Check for validation messages
    expect(screen.getAllByText(/required/i)).toHaveLength(3); // Customer, Start Date, End Date
  });

  it('enables export buttons after report generation', async () => {
    billingApi.generateReport.mockResolvedValue({ success: true, data: mockReport });

    renderWithProvider(<BillingReport />);
    
    // Initially export buttons should be disabled
    expect(screen.getByText(/export excel/i)).toBeDisabled();
    expect(screen.getByText(/export pdf/i)).toBeDisabled();
    
    // Fill in the form and submit
    fireEvent.change(screen.getByLabelText(/customer/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2024-01-31' } });
    fireEvent.click(screen.getByText(/generate report/i));
    
    // Wait for report generation
    await waitFor(() => {
      expect(screen.getByText(/export excel/i)).not.toBeDisabled();
      expect(screen.getByText(/export pdf/i)).not.toBeDisabled();
    });
  });
}); 