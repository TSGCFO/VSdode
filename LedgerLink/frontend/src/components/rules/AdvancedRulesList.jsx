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
  Alert,
  CircularProgress,
  Chip,
  Stack
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Functions as FunctionsIcon,
  Rule as RuleIcon
} from '@mui/icons-material';
import rulesService from '../../services/rulesService';

const AdvancedRulesList = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch advanced rules data
  const fetchAdvancedRules = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await rulesService.getAdvancedRules();
      setData(Array.isArray(response) ? response : []);
    } catch (err) {
      setError('Failed to fetch advanced rules');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdvancedRules();
  }, [fetchAdvancedRules]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      fetchAdvancedRules();
    };
    window.addEventListener('refreshRules', handleRefresh);
    return () => {
      window.removeEventListener('refreshRules', handleRefresh);
    };
  }, [fetchAdvancedRules]);

  const handleEditClick = useCallback(async (row) => {
    try {
      if (!row.original.id) {
        throw new Error('Rule ID is required');
      }
      setError(null);
      setIsLoading(true);
      await rulesService.updateAdvancedRule(row.original.id, row.original);
      await fetchAdvancedRules();
    } catch (err) {
      setError('Failed to edit advanced rule');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAdvancedRules]);

  const handleDeleteClick = useCallback(async (row) => {
    try {
      if (!row.original.id) {
        throw new Error('Rule ID is required');
      }
      setError(null);
      setIsLoading(true);
      await rulesService.deleteAdvancedRule(row.original.id);
      await fetchAdvancedRules();
    } catch (err) {
      setError('Failed to delete advanced rule');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAdvancedRules]);

  const formatConditions = useCallback((conditions) => {
    if (!conditions || typeof conditions !== 'object') return '-';
    return (
      <Stack direction="row" flexWrap="wrap" gap={0.5}>
        {Object.entries(conditions).map(([field, condition], index) => (
          <Chip
            key={index}
            icon={<RuleIcon />}
            label={`${field}: ${condition.operator} ${condition.value}`}
            size="small"
            color="primary"
            variant="outlined"
          />
        ))}
      </Stack>
    );
  }, []);

  const formatCalculations = useCallback((calculations) => {
    if (!Array.isArray(calculations) || calculations.length === 0) return '-';
    return (
      <Stack direction="row" flexWrap="wrap" gap={0.5}>
        {calculations.map((calc, index) => (
          <Chip
            key={index}
            icon={<FunctionsIcon />}
            label={`${calc.type}: ${calc.value}${calc.type === 'percentage' ? '%' : ''}`}
            size="small"
            color="secondary"
            variant="outlined"
          />
        ))}
      </Stack>
    );
  }, []);

  const columns = React.useMemo(
    () => [
      {
        accessorKey: 'rule_group',
        header: 'Rule Group',
        size: 200,
      },
      {
        accessorKey: 'conditions',
        header: 'Conditions',
        size: 300,
        Cell: ({ cell }) => formatConditions(cell.getValue()),
      },
      {
        accessorKey: 'calculations',
        header: 'Calculations',
        size: 300,
        Cell: ({ cell }) => formatCalculations(cell.getValue()),
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        size: 150,
      }
    ],
    [formatConditions, formatCalculations]
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
            aria-label={`Edit advanced rule for ${row.original.rule_group || 'unnamed group'}`}
            disabled={isLoading}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete" placement="right">
          <IconButton 
            color="error" 
            onClick={() => handleDeleteClick(row)}
            aria-label={`Delete advanced rule for ${row.original.rule_group || 'unnamed group'}`}
            disabled={isLoading}
          >
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
        No advanced rules found
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

export default AdvancedRulesList;