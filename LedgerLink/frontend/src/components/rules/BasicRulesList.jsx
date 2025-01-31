import React, { useState, useCallback } from 'react';
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
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const BasicRulesList = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sample data - replace with actual API call
  const data = React.useMemo(
    () => [
      {
        id: 1,
        rule_group: 'Service A Rules',
        field: 'weight_lb',
        operator: 'gt',
        value: '50',
        adjustment_amount: 10.00,
        created_at: '2024-01-31'
      },
      {
        id: 2,
        rule_group: 'Service B Rules',
        field: 'sku_quantity',
        operator: 'contains',
        value: 'SKU123;SKU456',
        adjustment_amount: 5.50,
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

  const handleEditClick = useCallback(async (row) => {
    try {
      setError(null);
      setIsLoading(true);
      // Handle edit rule
      console.log('Edit rule:', row.original);
      // TODO: Implement API call
    } catch (err) {
      setError('Failed to edit rule');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDeleteClick = useCallback(async (row) => {
    try {
      setError(null);
      setIsLoading(true);
      // Handle delete rule
      console.log('Delete rule:', row.original);
      // TODO: Implement API call
    } catch (err) {
      setError('Failed to delete rule');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const columns = React.useMemo(
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
          <Tooltip title={getFieldLabel(cell.getValue())} placement="top">
            <span>{cell.getValue()}</span>
          </Tooltip>
        ),
      },
      {
        accessorKey: 'operator',
        header: 'Operator',
        size: 150,
        Cell: ({ cell }) => (
          <Tooltip title={getOperatorLabel(cell.getValue())} placement="top">
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
        accessorKey: 'adjustment_amount',
        header: 'Adjustment',
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
    [getFieldLabel, getOperatorLabel]
  );

  const table = useMaterialReactTable({
    columns,
    data,
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip title="Edit" placement="left">
          <IconButton 
            onClick={() => handleEditClick(row)}
            aria-label={`Edit rule for ${row.original.rule_group}`}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete" placement="right">
          <IconButton 
            color="error" 
            onClick={() => handleDeleteClick(row)}
            aria-label={`Delete rule for ${row.original.rule_group}`}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="h6">Basic Rules</Typography>
      </Box>
    ),
    muiTableBodyRowProps: { hover: true },
    initialState: {
      pagination: { pageSize: 10 },
      sorting: [{ id: 'created_at', desc: true }],
    },
    state: {
      isLoading,
      showAlertBanner: !!error,
      showProgressBars: isLoading,
    },
    muiToolbarAlertBannerProps: error
      ? {
          color: 'error',
          children: error,
        }
      : undefined,
    renderEmptyRowsFallback: () => (
      <Typography
        align="center"
        sx={{ py: 3 }}
      >
        No rules found
      </Typography>
    ),
    positionToolbarAlertBanner: 'top',
  });

  return (
    <Box sx={{ position: 'relative' }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }} 
          onClose={() => setError(null)}
          role="alert"
        >
          {error}
        </Alert>
      )}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default BasicRulesList;