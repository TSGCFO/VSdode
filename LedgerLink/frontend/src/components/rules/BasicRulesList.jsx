import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useMaterialReactTable, MaterialReactTable } from 'material-react-table';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import rulesService from '../../services/rulesService';
import RuleBuilder from './RuleBuilder';

const BasicRulesList = ({ groupId }) => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRule, setEditingRule] = useState(null);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);

  useEffect(() => {
    if (groupId) {
      fetchRules();
    }
  }, [groupId]);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const fetchedRules = await rulesService.getRules(groupId);
      setRules(fetchedRules);
      setError(null);
    } catch (err) {
      setError('Failed to fetch rules. Please try again.');
      console.error('Error fetching rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async (ruleData) => {
    try {
      await rulesService.createRule(groupId, ruleData);
      await fetchRules();
      setShowRuleBuilder(false);
    } catch (err) {
      setError('Failed to create rule. Please try again.');
      console.error('Error creating rule:', err);
    }
  };

  const handleUpdateRule = async (id, ruleData) => {
    try {
      await rulesService.updateRule(id, ruleData);
      await fetchRules();
      setEditingRule(null);
    } catch (err) {
      setError('Failed to update rule. Please try again.');
      console.error('Error updating rule:', err);
    }
  };

  const handleDeleteRule = async (id) => {
    try {
      await rulesService.deleteRule(id);
      await fetchRules();
    } catch (err) {
      setError('Failed to delete rule. Please try again.');
      console.error('Error deleting rule:', err);
    }
  };

  const columns = [
    {
      accessorKey: 'field',
      header: 'Field',
      Cell: ({ row }) => {
        const fieldMap = Object.fromEntries(
          row.original.FIELD_CHOICES?.map(([value, label]) => [value, label]) || []
        );
        return <Typography>{fieldMap[row.original.field] || row.original.field}</Typography>;
      },
    },
    {
      accessorKey: 'operator',
      header: 'Operator',
      Cell: ({ row }) => {
        const operatorMap = Object.fromEntries(
          row.original.OPERATOR_CHOICES?.map(([value, label]) => [value, label]) || []
        );
        return <Typography>{operatorMap[row.original.operator] || row.original.operator}</Typography>;
      },
    },
    {
      accessorKey: 'value',
      header: 'Value',
    },
    {
      accessorKey: 'adjustment_amount',
      header: 'Adjustment Amount',
      Cell: ({ row }) => (
        <Typography>
          {row.original.adjustment_amount ? `$${row.original.adjustment_amount}` : 'N/A'}
        </Typography>
      ),
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const table = useMaterialReactTable({
    columns,
    data: rules,
    enableRowActions: true,
    positionActionsColumn: 'last',
    muiTableContainerProps: { sx: { maxHeight: '500px' } },
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => setEditingRule(row.original)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            color="error"
            onClick={() => handleDeleteRule(row.original.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    initialState: {
      sorting: [{ id: 'field', desc: false }],
      pagination: { pageSize: 10 },
    },
  });

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box mb={2} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowRuleBuilder(true)}
        >
          Create Rule
        </Button>
      </Box>

      <MaterialReactTable table={table} />

      {(showRuleBuilder || editingRule) && (
        <RuleBuilder
          groupId={groupId}
          initialData={editingRule}
          onSubmit={editingRule ? handleUpdateRule : handleCreateRule}
          onCancel={() => {
            setShowRuleBuilder(false);
            setEditingRule(null);
          }}
        />
      )}
    </Box>
  );
};

export default BasicRulesList;