import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
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

  useEffect(() => {
    fetchCustomerServices();
  }, []);

  const fetchCustomerServices = async () => {
    try {
      setLoading(true);
      const services = await rulesService.getCustomerServices();
      setCustomerServices(services);
    } catch (error) {
      console.error('Error fetching customer services:', error);
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

  if (loading) {
    return (
      <Dialog open fullWidth maxWidth="sm">
        <DialogContent>
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>
        {initialData ? 'Edit Rule Group' : 'Create Rule Group'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <FormControl fullWidth required>
              <InputLabel>Customer Service</InputLabel>
              <Select
                name="customer_service"
                value={formData.customer_service}
                onChange={handleChange}
                label="Customer Service"
              >
                {customerServices.map((service) => (
                  <MenuItem key={service.id} value={service.id}>
                    {service.name}
                  </MenuItem>
                ))}
              </Select>
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
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!formData.customer_service}
          >
            {initialData ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RuleGroupForm;