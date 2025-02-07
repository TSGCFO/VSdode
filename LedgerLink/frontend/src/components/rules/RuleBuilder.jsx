import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import RuleValidator from './core/RuleValidator';
import {
  FIELD_OPTIONS,
  STRING_OPERATORS,
  NUMBER_OPERATORS,
  SKU_OPERATORS,
} from './constants';

const RuleBuilder = ({ initialRule, onSave, onClose }) => {
  const [currentRule, setCurrentRule] = useState(
    initialRule || {
      field: '',
      operator: 'eq',
      value: '',
    }
  );

  const [validation, setValidation] = useState({
    isValid: true,
    errors: [],
    warnings: [],
  });

  const getOperatorsForField = useCallback((fieldName) => {
    const field = FIELD_OPTIONS.find(f => f.value === fieldName);
    if (!field) return [];

    switch (field.type) {
      case 'string':
        return STRING_OPERATORS;
      case 'number':
        return NUMBER_OPERATORS;
      case 'sku':
        return SKU_OPERATORS;
      default:
        return [];
    }
  }, []);

  const handleFieldChange = (event) => {
    const fieldName = event.target.value;
    const operators = getOperatorsForField(fieldName);
    
    setCurrentRule(prev => ({
      ...prev,
      field: fieldName,
      operator: operators[0]?.value || 'eq',
      value: '',
    }));

    validateRule({
      ...currentRule,
      field: fieldName,
    });
  };

  const handleOperatorChange = (event) => {
    const operator = event.target.value;
    setCurrentRule(prev => ({
      ...prev,
      operator,
    }));

    validateRule({
      ...currentRule,
      operator,
    });
  };

  const handleValueChange = (event) => {
    const value = event.target.value;
    setCurrentRule(prev => ({
      ...prev,
      value,
    }));

    validateRule({
      ...currentRule,
      value,
    });
  };

  const validateRule = (rule) => {
    const result = RuleValidator.validateRule(rule);
    setValidation(result);
    return result.isValid;
  };

  const handleSave = () => {
    if (validateRule(currentRule)) {
      onSave(currentRule);
    }
  };

  const getValueHelperText = () => {
    const field = FIELD_OPTIONS.find(f => f.value === currentRule.field);
    if (!field) return '';

    switch (field.type) {
      case 'number':
        return currentRule.operator === 'in' || currentRule.operator === 'ni'
          ? 'Enter numbers separated by semicolons (e.g., 1;2;3)'
          : 'Enter a number';
      case 'sku':
        return 'Enter SKUs separated by semicolons';
      case 'string':
        return currentRule.operator === 'in' || currentRule.operator === 'ni'
          ? 'Enter values separated by semicolons'
          : '';
      default:
        return '';
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {initialRule ? 'Edit Rule' : 'Create Rule'}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Field</InputLabel>
          <Select
            value={currentRule.field}
            onChange={handleFieldChange}
            label="Field"
          >
            {FIELD_OPTIONS.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Operator</InputLabel>
          <Select
            value={currentRule.operator}
            onChange={handleOperatorChange}
            label="Operator"
            disabled={!currentRule.field}
          >
            {getOperatorsForField(currentRule.field).map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Value"
          value={currentRule.value}
          onChange={handleValueChange}
          error={validation.errors.some(e => e.field === 'value')}
          helperText={
            validation.errors.find(e => e.field === 'value')?.message ||
            validation.warnings.find(w => w.field === 'value')?.message ||
            getValueHelperText()
          }
          disabled={!currentRule.field || !currentRule.operator}
        />

        {currentRule.adjustment_amount !== undefined && (
          <TextField
            fullWidth
            label="Adjustment Amount"
            type="number"
            value={currentRule.adjustment_amount}
            onChange={(e) => setCurrentRule(prev => ({
              ...prev,
              adjustment_amount: parseFloat(e.target.value)
            }))}
            error={validation.errors.some(e => e.field === 'adjustment_amount')}
            helperText={validation.errors.find(e => e.field === 'adjustment_amount')?.message}
          />
        )}

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!validation.isValid}
          >
            {initialRule ? 'Update' : 'Create'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default RuleBuilder;