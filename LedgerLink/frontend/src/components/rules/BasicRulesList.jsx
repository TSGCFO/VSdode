import React, { useState, useCallback, useEffect } from 'react';
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
import rulesService from '../../services/rulesService';

const BasicRulesList = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch rules data
  const fetchRules = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await rulesService.getRules();
      setData(Array.isArray(response) ? response : []);
    } catch (err) {
      setError('Failed to fetch rules');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      fetchRules();
    };
    window.addEventListener('refreshRules', handleRefresh);
    return () => {
      window.removeEventListener('refreshRules', handleRefresh);
    };
  }, [fetchRules]);

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
      if (!row.original.id) {
        throw new Error('Rule ID is required');
      }
      setError(null);
      setIsLoading(true);
      await rulesService.updateRule(row.original.id, row.original);
      await fetchRules(); // Refresh the list
    } catch (err) {
      setError('Failed to edit rule');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchRules]);

  const handleDeleteClick = useCallback(async (row) => {
    try {
      if (!row.original.id) {
        throw new Error('Rule ID is required');
      }
      setError(null);
      setIsLoading(true);
      await rulesService.deleteRule(row.original.id);
      await fetchRules(); // Refresh the list
    } catch (err) {
      setError('Failed to delete rule');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchRules]);

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
          if (!value) return '-';
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
          return value ? `$${parseFloat(value).toFixed(2)}` : '-';
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
            aria-label={`Edit rule for ${row.original.rule_group || 'unnamed group'}`}
            disabled={isLoading}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete" placement="right">
          <IconButton 
            color="error" 
            onClick={() => handleDeleteClick(row)}
            aria-label={`Delete rule for ${row.original.rule_group || 'unnamed group'}`}
            disabled={isLoading}
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