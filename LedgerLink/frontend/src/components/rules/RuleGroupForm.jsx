import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import rulesService from '../../services/rulesService';

const LOGIC_OPERATORS = [
  { value: 'AND', label: 'All conditions must be true (AND)' },
  { value: 'OR', label: 'Any condition can be true (OR)' },
  { value: 'NOT', label: 'Condition must not be true (NOT)' },
  { value: 'XOR', label: 'Only one condition must be true (XOR)' },
  { value: 'NAND', label: 'At least one condition must be false (NAND)' },
  { value: 'NOR', label: 'None of the conditions must be true (NOR)' },
];

const RuleGroupForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    customer_service: '',
    logic_operator: 'AND',
    ...initialData,
  });
  const [customerServices, setCustomerServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomerServices();
  }, []);

  const fetchCustomerServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const services = await rulesService.getCustomerServices();
      console.log('Fetched customer services:', services);
      if (!Array.isArray(services)) {
        throw new Error('Invalid response format');
      }
      if (services.length === 0) {
        setError('No customer services available. Please create a customer service first.');
      }
      setCustomerServices(services);
    } catch (error) {
      console.error('Error fetching customer services:', error);
      setError(
        error.message === 'Invalid response format'
          ? 'Invalid data received from server'
          : 'Failed to load customer services. Please try again.'
      );
      setCustomerServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>
        {initialData ? 'Edit Rule Group' : 'Create Rule Group'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <FormControl fullWidth required error={!loading && customerServices.length === 0}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box flexGrow={1}>
                  <InputLabel>Customer Service</InputLabel>
                  <Select
                    name="customer_service"
                    value={formData.customer_service}
                    onChange={handleChange}
                    label="Customer Service"
                    disabled={loading || customerServices.length === 0}
                    fullWidth
                  >
                    {customerServices.map((service) => (
                      <MenuItem key={service.id} value={service.id}>
                        {`${service.customer_details?.company_name || ''} - ${service.service_details?.service_name || ''}`}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
                {loading && <CircularProgress size={20} />}
              </Box>
              {loading ? (
                <FormHelperText>Loading customer services...</FormHelperText>
              ) : customerServices.length === 0 ? (
                <FormHelperText error>No customer services available</FormHelperText>
              ) : null}
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Logic Operator</InputLabel>
              <Select
                name="logic_operator"
                value={formData.logic_operator}
                onChange={handleChange}
                label="Logic Operator"
              >
                {LOGIC_OPERATORS.map((operator) => (
                  <MenuItem key={operator.value} value={operator.value}>
                    {operator.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Tooltip title={
            loading ? 'Loading customer services...' :
            error ? 'Please resolve the error to continue' :
            customerServices.length === 0 ? 'No customer services available' :
            !formData.customer_service ? 'Please select a customer service' :
            ''
          }>
            <span>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!formData.customer_service || loading || customerServices.length === 0 || error}
              >
                {initialData ? 'Update' : 'Create'}
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RuleGroupForm;