import React, { useState, useMemo, useCallback } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Chip,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Code as CodeIcon
} from '@mui/icons-material';

const AdvancedRulesList = () => {
  const [error, setError] = useState(null);

  // Sample data - replace with actual API call
  const data = useMemo(
    () => [
      {
        id: 1,
        rule_group: 'Service A Rules',
        field: 'weight_lb',
        operator: 'gt',
        value: '50',
        adjustment_amount: 10.00,
        conditions: {
          'ship_to_country': { 'eq': 'USA' },
          'carrier': { 'in': ['UPS', 'FedEx'] }
        },
        calculations: [
          { type: 'flat_fee', value: 5.00 },
          { type: 'percentage', value: 10 }
        ],
        created_at: '2024-01-31'
      },
      {
        id: 2,
        rule_group: 'Service B Rules',
        field: 'sku_quantity',
        operator: 'contains',
        value: 'SKU123;SKU456',
        adjustment_amount: 5.50,
        conditions: {
          'total_item_qty': { 'gt': 10 }
        },
        calculations: [
          { type: 'per_unit', value: 0.50 }
        ],
        created_at: '2024-01-31'
      }
    ],
    []
  );

  const getOperatorLabel = useCallback((operator) => {
    const operatorMap = {
      'gt': 'Greater than',
      'lt': 'Less than',
      'eq': 'Equals',
      'ne': 'Not equals',
      'ge': 'Greater than or equals',
      'le': 'Less than or equals',
      'in': 'In',
      'ni': 'Not in',
      'contains': 'Contains',
      'ncontains': 'Not contains',
      'only_contains': 'Only Contains',
      'startswith': 'Starts with',
      'endswith': 'Ends with'
    };
    return operatorMap[operator] || operator;
  }, []);

  const getFieldLabel = useCallback((field) => {
    const fieldMap = {
      'reference_number': 'Reference Number',
      'ship_to_name': 'Ship To Name',
      'ship_to_company': 'Ship To Company',
      'ship_to_city': 'Ship To City',
      'ship_to_state': 'Ship To State',
      'ship_to_country': 'Ship To Country',
      'weight_lb': 'Weight (lb)',
      'line_items': 'Line Items',
      'sku_quantity': 'SKU Quantity',
      'total_item_qty': 'Total Item Quantity',
      'packages': 'Packages',
      'notes': 'Notes',
      'carrier': 'Carrier',
      'volume_cuft': 'Volume (cuft)'
    };
    return fieldMap[field] || field;
  }, []);

  const renderConditions = useCallback((conditions) => {
    return Object.entries(conditions).map(([field, condition]) => {
      const [operator, value] = Object.entries(condition)[0];
      return (
        <Chip
          key={field}
          label={`${getFieldLabel(field)} ${getOperatorLabel(operator)} ${value}`}
          size="small"
          sx={{ mr: 0.5, mb: 0.5 }}
        />
      );
    });
  }, [getFieldLabel, getOperatorLabel]);

  const renderCalculations = useCallback((calculations) => {
    const typeLabels = {
      'flat_fee': 'Flat Fee',
      'percentage': 'Percentage',
      'per_unit': 'Per Unit',
      'weight_based': 'Weight Based',
      'volume_based': 'Volume Based',
      'tiered_percentage': 'Tiered Percentage',
      'product_specific': 'Product Specific'
    };

    return calculations.map((calc, index) => (
      <Chip
        key={index}
        label={`${typeLabels[calc.type]}: ${calc.value}`}
        size="small"
        sx={{ mr: 0.5, mb: 0.5 }}
      />
    ));
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'rule_group',
        header: 'Rule Group',
        size: 200,
      },
      {
        accessorKey: 'field',
        header: 'Field',
        size: 150,
        Cell: ({ cell }) => (
          <Tooltip title={getFieldLabel(cell.getValue())}>
            <span>{cell.getValue()}</span>
          </Tooltip>
        ),
      },
      {
        accessorKey: 'operator',
        header: 'Operator',
        size: 150,
        Cell: ({ cell }) => (
          <Tooltip title={getOperatorLabel(cell.getValue())}>
            <span>{cell.getValue()}</span>
          </Tooltip>
        ),
      },
      {
        accessorKey: 'value',
        header: 'Value',
        size: 200,
        Cell: ({ cell, row }) => {
          const value = cell.getValue();
          if (row.original.field === 'sku_quantity') {
            return value.split(';').map((sku, index) => (
              <Chip
                key={index}
                label={sku}
                size="small"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ));
          }
          return value;
        },
      },
      {
        accessorKey: 'conditions',
        header: 'Conditions',
        size: 300,
        Cell: ({ cell }) => renderConditions(cell.getValue()),
      },
      {
        accessorKey: 'calculations',
        header: 'Calculations',
        size: 300,
        Cell: ({ cell }) => renderCalculations(cell.getValue()),
      },
      {
        accessorKey: 'adjustment_amount',
        header: 'Base Adjustment',
        size: 120,
        Cell: ({ cell }) => {
          const value = cell.getValue();
          return `$${parseFloat(value).toFixed(2)}`;
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        size: 150,
      }
    ],
    [getFieldLabel, getOperatorLabel, renderConditions, renderCalculations]
  );

  const handleEditClick = useCallback((row) => {
    try {
      // Handle edit advanced rule
      console.log('Edit advanced rule:', row.original);
    } catch (err) {
      setError('Failed to edit rule');
      console.error(err);
    }
  }, []);

  const handleDeleteClick = useCallback((row) => {
    try {
      // Handle delete advanced rule
      console.log('Delete advanced rule:', row.original);
    } catch (err) {
      setError('Failed to delete rule');
      console.error(err);
    }
  }, []);

  const handleViewCodeClick = useCallback((row) => {
    try {
      // Handle view JSON code
      console.log('View code for:', row.original);
    } catch (err) {
      setError('Failed to view code');
      console.error(err);
    }
  }, []);

  const table = useMaterialReactTable({
    columns,
    data,
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip title="View Code">
          <IconButton onClick={() => handleViewCodeClick(row)}>
            <CodeIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit">
          <IconButton onClick={() => handleEditClick(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => handleDeleteClick(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="h6">Advanced Rules</Typography>
      </Box>
    ),
    muiTableBodyRowProps: { hover: true },
    initialState: {
      pagination: { pageSize: 10 },
      sorting: [{ id: 'created_at', desc: true }],
    },
    enableColumnResizing: true,
    enableFullScreenToggle: false,
    enableDensityToggle: true,
    enableColumnFilters: true,
    enableFilters: true,
    enableHiding: true,
    state: {
      isLoading: false,
      showAlertBanner: false,
      showProgressBars: false,
    },
  });

  return (
    <Box sx={{ position: 'relative' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default AdvancedRulesList;