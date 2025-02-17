import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ReportFilters from '../ReportFilters';
import { customerApi } from '../../../utils/apiClient';

// Mock the API client
jest.mock('../../../utils/apiClient', () => ({
  customerApi: {
    list: jest.fn(),
  },
}));

const mockCustomers = [
  { id: 1, company_name: 'Company 1' },
  { id: 2, company_name: 'Company 2' },
  { id: 3, company_name: 'Company 3' },
];

const renderWithProvider = (component) => {
  return render(
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {component}
    </LocalizationProvider>
  );
};

describe('ReportFilters Component', () => {
  const mockOnSubmit = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    customerApi.list.mockResolvedValue({ success: true, data: mockCustomers });
  });

  it('renders without crashing', async () => {
    renderWithProvider(<ReportFilters onSubmit={mockOnSubmit} loading={false} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/customer/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
      expect(screen.getByText(/generate report/i)).toBeInTheDocument();
    });
  });

  it('loads and displays customer list', async () => {
    renderWithProvider(<ReportFilters onSubmit={mockOnSubmit} loading={false} />);
    
    // Wait for customers to load
    await waitFor(() => {
      expect(customerApi.list).toHaveBeenCalled();
    });

    // Open customer dropdown
    fireEvent.mouseDown(screen.getByLabelText(/customer/i));
    
    // Check if all customers are displayed
    mockCustomers.forEach(customer => {
      expect(screen.getByText(customer.company_name)).toBeInTheDocument();
    });
  });

  it('handles customer API error gracefully', async () => {
    const errorMessage = 'Failed to fetch customers';
    customerApi.list.mockRejectedValue(new Error(errorMessage));
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    renderWithProvider(<ReportFilters onSubmit={mockOnSubmit} loading={false} />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch customers:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  it('submits form with correct data', async () => {
    renderWithProvider(<ReportFilters onSubmit={mockOnSubmit} loading={false} />);
    
    // Wait for customers to load
    await waitFor(() => {
      expect(customerApi.list).toHaveBeenCalled();
    });

    // Fill in the form
    fireEvent.mouseDown(screen.getByLabelText(/customer/i));
    fireEvent.click(screen.getByText('Company 1'));
    
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: startDate } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: endDate } });
    
    // Submit form
    fireEvent.click(screen.getByText(/generate report/i));
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      customer_id: 1,
      start_date: startDate,
      end_date: endDate,
    });
  });

  it('disables submit button when loading', async () => {
    renderWithProvider(<ReportFilters onSubmit={mockOnSubmit} loading={true} />);
    
    const submitButton = screen.getByText(/generate report/i);
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderWithProvider(<ReportFilters onSubmit={mockOnSubmit} loading={false} />);
    
    // Submit form without filling in any fields
    fireEvent.click(screen.getByText(/generate report/i));
    
    // Check for required field validation
    expect(screen.getByLabelText(/customer/i)).toBeRequired();
    expect(screen.getByLabelText(/start date/i)).toBeRequired();
    expect(screen.getByLabelText(/end date/i)).toBeRequired();
    
    // Ensure onSubmit was not called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('updates form data when fields change', async () => {
    renderWithProvider(<ReportFilters onSubmit={mockOnSubmit} loading={false} />);
    
    // Wait for customers to load
    await waitFor(() => {
      expect(customerApi.list).toHaveBeenCalled();
    });

    // Select customer
    fireEvent.mouseDown(screen.getByLabelText(/customer/i));
    fireEvent.click(screen.getByText('Company 2'));
    
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    
    // Set dates
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: startDate } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: endDate } });
    
    // Submit form
    fireEvent.click(screen.getByText(/generate report/i));
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      customer_id: 2,
      start_date: startDate,
      end_date: endDate,
    });
  });
}); 