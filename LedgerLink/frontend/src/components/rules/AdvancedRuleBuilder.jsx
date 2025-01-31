import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  Divider,
  TextField,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Code as CodeIcon,
  Preview as PreviewIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';

const CALCULATION_TYPES = [
  { value: 'flat_fee', label: 'Flat Fee', description: 'Add fixed amount' },
  { value: 'percentage', label: 'Percentage', description: 'Add percentage of base price' },
  { value: 'per_unit', label: 'Per Unit', description: 'Multiply by quantity' },
  { value: 'weight_based', label: 'Weight Based', description: 'Multiply by weight' },
  { value: 'volume_based', label: 'Volume Based', description: 'Multiply by volume' },
  { value: 'tiered_percentage', label: 'Tiered Percentage', description: 'Apply percentage based on value tiers' },
  { value: 'product_specific', label: 'Product Specific', description: 'Apply specific rates per product' }
];

const FIELD_OPTIONS = [
  { value: 'reference_number', label: 'Reference Number', type: 'string' },
  { value: 'ship_to_name', label: 'Ship To Name', type: 'string' },
  { value: 'ship_to_company', label: 'Ship To Company', type: 'string' },
  { value: 'ship_to_city', label: 'Ship To City', type: 'string' },
  { value: 'ship_to_state', label: 'Ship To State', type: 'string' },
  { value: 'ship_to_country', label: 'Ship To Country', type: 'string' },
  { value: 'weight_lb', label: 'Weight (lb)', type: 'number' },
  { value: 'line_items', label: 'Line Items', type: 'number' },
  { value: 'sku_quantity', label: 'SKU Quantity', type: 'sku' },
  { value: 'total_item_qty', label: 'Total Item Quantity', type: 'number' },
  { value: 'packages', label: 'Packages', type: 'number' },
  { value: 'notes', label: 'Notes', type: 'string' },
  { value: 'carrier', label: 'Carrier', type: 'string' },
  { value: 'volume_cuft', label: 'Volume (cuft)', type: 'number' }
];

const OPERATORS = {
  string: [
    { value: 'eq', label: 'Equals' },
    { value: 'ne', label: 'Not equals' },
    { value: 'in', label: 'In' },
    { value: 'ni', label: 'Not in' },
    { value: 'contains', label: 'Contains' },
    { value: 'ncontains', label: 'Not contains' },
    { value: 'startswith', label: 'Starts with' },
    { value: 'endswith', label: 'Ends with' }
  ],
  number: [
    { value: 'gt', label: 'Greater than' },
    { value: 'lt', label: 'Less than' },
    { value: 'eq', label: 'Equals' },
    { value: 'ne', label: 'Not equals' },
    { value: 'ge', label: 'Greater than or equals' },
    { value: 'le', label: 'Less than or equals' }
  ],
  sku: [
    { value: 'contains', label: 'Contains' },
    { value: 'ncontains', label: 'Not contains' },
    { value: 'only_contains', label: 'Only Contains' }
  ]
};

const ConditionCard = ({ condition, onDelete, onUpdate }) => {
  const handleFieldChange = (event) => {
    onUpdate({
      ...condition,
      field: event.target.value,
      operator: '',
      value: ''
    });
  };

  const handleOperatorChange = (event) => {
    onUpdate({
      ...condition,
      operator: event.target.value,
      value: ''
    });
  };

  const handleValueChange = (event) => {
    onUpdate({
      ...condition,
      value: event.target.value
    });
  };

  const selectedField = FIELD_OPTIONS.find(f => f.value === condition.field);
  const operators = selectedField ? OPERATORS[selectedField.type] : [];

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <DragIcon sx={{ mr: 1, cursor: 'move' }} />
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>Field</InputLabel>
                <Select
                  value={condition.field}
                  onChange={handleFieldChange}
                  label="Field"
                >
                  {FIELD_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>Operator</InputLabel>
                <Select
                  value={condition.operator}
                  onChange={handleOperatorChange}
                  label="Operator"
                  disabled={!condition.field}
                >
                  {operators.map((op) => (
                    <MenuItem key={op.value} value={op.value}>
                      {op.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Value"
                value={condition.value}
                onChange={handleValueChange}
                disabled={!condition.operator}
                type={selectedField?.type === 'number' ? 'number' : 'text'}
              />
            </Grid>
          </Grid>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <IconButton onClick={() => onDelete(condition.id)} color="error">
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

ConditionCard.propTypes = {
  condition: PropTypes.shape({
    id: PropTypes.string.isRequired,
    field: PropTypes.string.isRequired,
    operator: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired
};

const CalculationCard = ({ calculation, onDelete, onUpdate }) => {
  const handleTypeChange = (event) => {
    onUpdate({
      ...calculation,
      type: event.target.value,
      value: ''
    });
  };

  const handleValueChange = (event) => {
    onUpdate({
      ...calculation,
      value: event.target.value
    });
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <DragIcon sx={{ mr: 1, cursor: 'move' }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={calculation.type}
                  onChange={handleTypeChange}
                  label="Type"
                >
                  {CALCULATION_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Tooltip title={type.description}>
                        <span>{type.label}</span>
                      </Tooltip>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Value"
                value={calculation.value}
                onChange={handleValueChange}
                type="number"
                inputProps={{ step: '0.01' }}
              />
            </Grid>
          </Grid>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <IconButton onClick={() => onDelete(calculation.id)} color="error">
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

CalculationCard.propTypes = {
  calculation: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired
};

const AdvancedRuleBuilder = ({ onClose, onSave }) => {
  const [conditions, setConditions] = useState([]);
  const [calculations, setCalculations] = useState([]);
  const [showJson, setShowJson] = useState(false);
  const [error, setError] = useState('');

  const addCondition = () => {
    const newCondition = {
      id: `condition-${Date.now()}`,
      field: '',
      operator: '',
      value: ''
    };
    setConditions([...conditions, newCondition]);
  };

  const addCalculation = () => {
    const newCalculation = {
      id: `calculation-${Date.now()}`,
      type: '',
      value: ''
    };
    setCalculations([...calculations, newCalculation]);
  };

  const updateCondition = (id, updatedCondition) => {
    setConditions(conditions.map(c => 
      c.id === id ? updatedCondition : c
    ));
  };

  const updateCalculation = (id, updatedCalculation) => {
    setCalculations(calculations.map(c => 
      c.id === id ? updatedCalculation : c
    ));
  };

  const deleteCondition = (id) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const deleteCalculation = (id) => {
    setCalculations(calculations.filter(c => c.id !== id));
  };

  const handleSave = () => {
    // Validate conditions and calculations
    const invalidConditions = conditions.some(c => 
      !c.field || !c.operator || !c.value
    );
    const invalidCalculations = calculations.some(c => 
      !c.type || !c.value
    );

    if (invalidConditions || invalidCalculations) {
      setError('Please fill in all required fields');
      return;
    }

    // Format data for saving
    const formattedConditions = {};
    conditions.forEach(c => {
      formattedConditions[c.field] = { [c.operator]: c.value };
    });

    const formattedCalculations = calculations.map(c => ({
      type: c.type,
      value: parseFloat(c.value)
    }));

    onSave({
      conditions: formattedConditions,
      calculations: formattedCalculations
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Advanced Rule Builder
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1">Conditions</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={addCondition}
                variant="outlined"
                size="small"
              >
                Add Condition
              </Button>
            </Box>
            {conditions.map((condition) => (
              <ConditionCard
                key={condition.id}
                condition={condition}
                onDelete={deleteCondition}
                onUpdate={(updated) => updateCondition(condition.id, updated)}
              />
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1">Calculations</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={addCalculation}
                variant="outlined"
                size="small"
              >
                Add Calculation
              </Button>
            </Box>
            {calculations.map((calculation) => (
              <CalculationCard
                key={calculation.id}
                calculation={calculation}
                onDelete={deleteCalculation}
                onUpdate={(updated) => updateCalculation(calculation.id, updated)}
              />
            ))}
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          startIcon={<CodeIcon />}
          onClick={() => setShowJson(!showJson)}
          variant="outlined"
        >
          {showJson ? 'Hide JSON' : 'Show JSON'}
        </Button>
        <Box>
          <Button
            onClick={onClose}
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            startIcon={<PreviewIcon />}
          >
            Preview & Save
          </Button>
        </Box>
      </Box>

      {showJson && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            JSON Preview
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={JSON.stringify({
              conditions: conditions.reduce((acc, c) => ({
                ...acc,
                [c.field]: { [c.operator]: c.value }
              }), {}),
              calculations: calculations.map(c => ({
                type: c.type,
                value: parseFloat(c.value)
              }))
            }, null, 2)}
            InputProps={{
              readOnly: true
            }}
          />
        </Paper>
      )}
    </Box>
  );
};

AdvancedRuleBuilder.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default AdvancedRuleBuilder;