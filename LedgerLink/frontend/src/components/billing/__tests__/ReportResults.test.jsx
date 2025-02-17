import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReportResults from '../ReportResults';

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

describe('ReportResults Component', () => {
  const mockOnExport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders report summary correctly', () => {
    render(<ReportResults report={mockReport} onExport={mockOnExport} loading={false} />);
    
    // Check summary section
    expect(screen.getByText('Report Summary')).toBeInTheDocument();
    expect(screen.getByText('$1,000.00')).toBeInTheDocument();
    expect(screen.getByText('1/1/2024 - 1/31/2024')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Total orders
  });

  it('renders service totals correctly', () => {
    render(<ReportResults report={mockReport} onExport={mockOnExport} loading={false} />);
    
    // Check service totals section
    expect(screen.getByText('Service Totals')).toBeInTheDocument();
    expect(screen.getByText('Service 1')).toBeInTheDocument();
    expect(screen.getByText('Service 2')).toBeInTheDocument();
    expect(screen.getAllByText('$500.00')).toHaveLength(2);
  });

  it('renders orders table correctly', () => {
    render(<ReportResults report={mockReport} onExport={mockOnExport} loading={false} />);
    
    // Check orders table
    expect(screen.getByText('Order Details')).toBeInTheDocument();
    expect(screen.getByText('ORDER-001')).toBeInTheDocument();
    
    // Check service chips in the table
    const serviceChips = screen.getAllByText(/Service \d: \$500.00/);
    expect(serviceChips).toHaveLength(2);
  });

  it('handles export button clicks', () => {
    render(<ReportResults report={mockReport} onExport={mockOnExport} loading={false} />);
    
    // Click export buttons
    fireEvent.click(screen.getByText(/export excel/i));
    expect(mockOnExport).toHaveBeenCalledWith('excel');
    
    fireEvent.click(screen.getByText(/export pdf/i));
    expect(mockOnExport).toHaveBeenCalledWith('pdf');
  });

  it('disables export buttons when loading', () => {
    render(<ReportResults report={mockReport} onExport={mockOnExport} loading={true} />);
    
    const excelButton = screen.getByText(/export excel/i);
    const pdfButton = screen.getByText(/export pdf/i);
    
    expect(excelButton).toBeDisabled();
    expect(pdfButton).toBeDisabled();
  });

  it('formats currency values correctly', () => {
    const reportWithDifferentAmounts = {
      ...mockReport,
      total_amount: 1234567.89,
      orders: [
        {
          order_id: 'ORDER-001',
          services: [
            { service_id: 1, service_name: 'Service 1', amount: 1000000.00 },
            { service_id: 2, service_name: 'Service 2', amount: 234567.89 },
          ],
          total_amount: 1234567.89,
        },
      ],
      service_totals: {
        1: { name: 'Service 1', amount: 1000000.00 },
        2: { name: 'Service 2', amount: 234567.89 },
      },
    };

    render(<ReportResults report={reportWithDifferentAmounts} onExport={mockOnExport} loading={false} />);
    
    expect(screen.getByText('$1,234,567.89')).toBeInTheDocument();
    expect(screen.getByText('$1,000,000.00')).toBeInTheDocument();
    expect(screen.getByText('$234,567.89')).toBeInTheDocument();
  });

  it('handles empty orders array', () => {
    const emptyReport = {
      ...mockReport,
      orders: [],
      total_amount: 0,
      service_totals: {},
    };

    render(<ReportResults report={emptyReport} onExport={mockOnExport} loading={false} />);
    
    expect(screen.getByText('$0.00')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // Total orders
  });

  it('renders the table with correct columns', () => {
    render(<ReportResults report={mockReport} onExport={mockOnExport} loading={false} />);
    
    expect(screen.getByText('Order ID')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('displays service chips with correct formatting', () => {
    render(<ReportResults report={mockReport} onExport={mockOnExport} loading={false} />);
    
    const serviceChips = screen.getAllByText(/Service \d: \$500.00/);
    serviceChips.forEach(chip => {
      expect(chip).toHaveStyle({ textTransform: 'none' }); // MUI Chip default style
    });
  });
}); 