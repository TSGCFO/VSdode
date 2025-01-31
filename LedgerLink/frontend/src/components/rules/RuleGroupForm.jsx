import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';

const LOGIC_OPERATORS = [
  { value: 'AND', label: 'All conditions must be true (AND)' },
  { value: 'OR', label: 'Any condition can be true (OR)' },
  { value: 'NOT', label: 'Condition must not be true (NOT)' },
  { value: 'XOR', label: 'Only one condition must be true (XOR)' },
  { value: 'NAND', label: 'At least one condition must be false (NAND)' },
  { value: 'NOR', label: 'None of the conditions must be true (NOR)' }
];

const RuleGroupForm = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    customer_service: '',
    logic_operator: 'AND'
  });
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
    loadCustomerServices();
  }, [initialData]);

  const loadCustomerServices = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      // For now, using temporary data
      const tempServices = [
        { id: 1, name: 'Service A' },
        { id: 2, name: 'Service B' },
        { id: 3, name: 'Service C' }
      ];
      setServices(tempServices);
    } catch (err) {
      setError('Failed to load customer services');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Validate form data
      if (!formData.customer_service) {
        setError('Please select a customer service');
        return;
      }

      await onSave(formData);
      onClose();
    } catch (err) {
      setError('Failed to save rule group');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="customer-service-label">Customer Service</InputLabel>
            <Select
              labelId="customer-service-label"
              id="customer-service"
              name="customer_service"
              value={formData.customer_service}
              onChange={handleChange}
              label="Customer Service"
              disabled={isLoading}
            >
              {services.map((service) => (
                <MenuItem key={service.id} value={service.id}>
                  {service.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="logic-operator-label">Logic Operator</InputLabel>
            <Select
              labelId="logic-operator-label"
              id="logic-operator"
              name="logic_operator"
              value={formData.logic_operator}
              onChange={handleChange}
              label="Logic Operator"
              disabled={isLoading}
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
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          Save
        </Button>
      </DialogActions>
    </>
  );
};

RuleGroupForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    customer_service: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    logic_operator: PropTypes.string
  })
};

export default RuleGroupForm;