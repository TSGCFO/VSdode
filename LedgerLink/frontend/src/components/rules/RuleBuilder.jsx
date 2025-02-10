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
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import rulesService from '../../services/rulesService';

const RuleBuilder = ({ groupId, initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    field: '',
    operator: '',
    value: '',
    adjustment_amount: '',
    ...initialData,
  });
  const [fields, setFields] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFields();
  }, []);

  useEffect(() => {
    console.log('Field changed:', formData.field);
    if (formData.field) {
      fetchOperators(formData.field);
    }
  }, [formData.field]);

  const fetchFields = async () => {
    try {
      setLoading(true);
      const availableFields = await rulesService.getAvailableFields();
      console.log('Available fields:', availableFields);
      setFields(availableFields);
    } catch (err) {
      setError('Failed to fetch fields. Please try again.');
      console.error('Error fetching fields:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOperators = async (field) => {
    try {
      console.log('Fetching operators for field:', field);
      const availableOperators = await rulesService.getOperatorChoices(field);
      console.log('Available operators:', availableOperators);
      setOperators(availableOperators);
      // Reset operator if current one is not valid for new field
      if (!availableOperators.find(op => op.value === formData.operator)) {
        setFormData(prev => ({ ...prev, operator: '' }));
      }
    } catch (err) {
      console.error('Error fetching operators:', err);
    }
  };

  const handleChange = async (event) => {
    const { name, value } = event.target;
    console.log('handleChange:', name, value);
    
    // Update form data immediately for UI responsiveness
    setFormData(prev => ({ ...prev, [name]: value }));

    // If field changed, operators will be fetched via useEffect
    if (name === 'field') {
      // Reset operator and value when field changes
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        operator: '',
        value: ''
      }));
    }

    if (name === 'value') {
      try {
        await rulesService.validateRuleValue({
          field: formData.field,
          operator: formData.operator,
          value
        });
        setError(null);
      } catch (err) {
        setError('Invalid value format for selected field and operator.');
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      if (initialData) {
        await onSubmit(initialData.id, formData);
      } else {
        await onSubmit(formData);
      }
      setError(null);
      onCancel();
    } catch (err) {
      setError('Failed to save rule. Please check your inputs and try again.');
      console.error('Error saving rule:', err);
    } finally {
      setLoading(false);
    }
  };

  const isNumericField = (field) => {
    const numericFields = [
      'weight_lb',
      'line_items',
      'total_item_qty',
      'volume_cuft',
      'sku_count',
      'packages'
    ];
    return numericFields.includes(field);
  };

  if (loading && !formData.field) {
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
        {initialData ? 'Edit Rule' : 'Create Rule'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            <FormControl fullWidth required>
              <InputLabel>Field</InputLabel>
              <Select
                name="field"
                value={formData.field}
                onChange={handleChange}
                label="Field"
              >
                {fields.map((field) => (
                  <MenuItem key={field.value} value={field.value}>
                    {field.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required disabled={!formData.field}>
              <InputLabel>Operator</InputLabel>
              <Select
                name="operator"
                value={formData.operator}
                onChange={handleChange}
                label="Operator"
              >
                {operators.map((operator) => (
                  <MenuItem key={operator.value} value={operator.value}>
                    {operator.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              required
              label="Value"
              name="value"
              value={formData.value}
              onChange={handleChange}
              disabled={!formData.operator}
              type={isNumericField(formData.field) ? 'number' : 'text'}
              helperText={formData.field === 'sku_quantity' ? 
                'For multiple values, separate with semicolon (;)' : ''}
            />

            <TextField
              fullWidth
              label="Adjustment Amount"
              name="adjustment_amount"
              value={formData.adjustment_amount}
              onChange={handleChange}
              type="number"
              inputProps={{ step: '0.01' }}
              helperText="Optional: Amount to adjust the price"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !formData.field || !formData.operator || !formData.value}
          >
            {loading ? <CircularProgress size={24} /> : (initialData ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RuleBuilder;