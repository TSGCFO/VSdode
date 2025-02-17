import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Button,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { customerApi, handleApiError } from '../../utils/apiClient';
import PropTypes from 'prop-types';

const ReportFilters = ({ onSubmit, loading }) => {
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    start_date: null,
    end_date: null,
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      setError(null);
      const response = await customerApi.list();
      if (response && response.data) {
        setCustomers(response.data);
      } else {
        throw new Error('No customers data received');
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setError(handleApiError(err));
    } finally {
      setLoadingCustomers(false);
    }
  };

  const validateDates = () => {
    if (!formData.start_date || !formData.end_date) {
      return 'Both start and end dates are required';
    }

    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Invalid date format';
    }

    if (start > end) {
      return 'Start date must be before end date';
    }

    const maxRange = new Date(start);
    maxRange.setFullYear(maxRange.getFullYear() + 1);
    if (end > maxRange) {
      return 'Date range cannot exceed 1 year';
    }

    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // Validate form data
    if (!formData.customer_id) {
      setError('Please select a customer');
      return;
    }

    const dateError = validateDates();
    if (dateError) {
      setError(dateError);
      return;
    }

    // Format dates to ISO string for API
    const submitData = {
      ...formData,
      start_date: formData.start_date.toISOString(),
      end_date: formData.end_date.toISOString(),
    };

    onSubmit(submitData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth error={!formData.customer_id}>
            <InputLabel>Customer</InputLabel>
            <Select
              value={formData.customer_id}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, customer_id: e.target.value }));
                setError(null);
              }}
              label="Customer"
              disabled={loading || loadingCustomers}
            >
              {loadingCustomers ? (
                <MenuItem disabled>
                  <CircularProgress size={20} /> Loading customers...
                </MenuItem>
              ) : customers.length === 0 ? (
                <MenuItem disabled>No customers available</MenuItem>
              ) : (
                customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.company_name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <DatePicker
            label="Start Date"
            value={formData.start_date}
            onChange={(date) => {
              setFormData(prev => ({ ...prev, start_date: date }));
              setError(null);
            }}
            disabled={loading}
            slotProps={{
              textField: {
                fullWidth: true,
                error: Boolean(error && !formData.start_date)
              }
            }}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <DatePicker
            label="End Date"
            value={formData.end_date}
            onChange={(date) => {
              setFormData(prev => ({ ...prev, end_date: date }));
              setError(null);
            }}
            disabled={loading}
            slotProps={{
              textField: {
                fullWidth: true,
                error: Boolean(error && !formData.end_date)
              }
            }}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || loadingCustomers}
            sx={{ height: '56px' }}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate Report'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

ReportFilters.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default ReportFilters; 