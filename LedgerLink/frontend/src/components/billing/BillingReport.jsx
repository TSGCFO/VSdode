import { useState } from 'react';
import { Box, Paper, Typography, Alert } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ReportFilters from './ReportFilters';
import ReportResults from './ReportResults';
import { billingApi, handleApiError } from '../../utils/apiClient';

const BillingReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateReport = async (params) => {
    try {
      setLoading(true);
      setError(null);
      setReport(null);
      
      const response = await billingApi.generateReport(params);
      
      if (response && response.report) {
        setReport({
          customer_id: response.report.customer_id,
          start_date: response.report.start_date,
          end_date: response.report.end_date,
          total_amount: response.report.total_amount,
          orders: response.report.orders || [],
          service_totals: response.report.service_totals || []
        });
      } else {
        throw new Error('Invalid report data received');
      }
    } catch (err) {
      console.error('Report generation error:', err);
      setError(
        err.status === 404 
          ? 'The billing report endpoint could not be found. Please check your API configuration.'
          : err.message || 'Failed to generate report'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      if (!report) {
        throw new Error('No report data available to export');
      }

      setLoading(true);
      setError(null);

      const response = await billingApi.exportReport({
        customer_id: report.customer_id,
        start_date: report.start_date,
        end_date: report.end_date,
        output_format: format
      }, {
        responseType: 'blob'
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `billing_report.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error('Export error:', err);
      setError(
        err.status === 404 
          ? 'The export endpoint could not be found. Please check your API configuration.'
          : err.message || 'Failed to export report'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Billing Report
          </Typography>

          <ReportFilters 
            onSubmit={handleGenerateReport}
            loading={loading}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}

          {report && (
            <ReportResults 
              report={report}
              onExport={handleExport}
              loading={loading}
            />
          )}
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default BillingReport; 