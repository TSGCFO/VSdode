import { useState, useCallback } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import RuleGroupForm from './RuleGroupForm';

const RuleGroupsList = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Sample data - replace with actual API call
  const data = [
    {
      id: 1,
      customer_service: 'Service A',
      logic_operator: 'AND',
      rules_count: 3,
      created_at: '2024-01-31'
    },
    {
      id: 2,
      customer_service: 'Service B',
      logic_operator: 'OR',
      rules_count: 2,
      created_at: '2024-01-31'
    }
  ];

  const handleCreateClick = useCallback(() => {
    setSelectedGroup(null);
    setIsFormOpen(true);
  }, []);

  const handleEditClick = useCallback((row) => {
    setSelectedGroup(row.original);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback(async (row) => {
    try {
      setError(null);
      setIsLoading(true);
      // TODO: Implement API call
      console.log('Delete rule group:', row.original);
    } catch (err) {
      setError('Failed to delete rule group');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSaveGroup = async (formData) => {
    try {
      setError(null);
      setIsLoading(true);
      // TODO: Implement API call
      console.log('Save rule group:', formData);
      setIsFormOpen(false);
    } catch (err) {
      setError('Failed to save rule group');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      accessorKey: 'customer_service',
      header: 'Customer Service',
      size: 200,
    },
    {
      accessorKey: 'logic_operator',
      header: 'Logic',
      size: 150,
      Cell: ({ cell }) => {
        const value = cell.getValue();
        const logicMap = {
          'AND': 'All conditions must be true',
          'OR': 'Any condition can be true',
          'NOT': 'Condition must not be true',
          'XOR': 'Only one condition must be true',
          'NAND': 'At least one condition must be false',
          'NOR': 'None of the conditions must be true'
        };
        return (
          <Tooltip title={logicMap[value] || value} placement="top">
            <span>{value}</span>
          </Tooltip>
        );
      },
    },
    {
      accessorKey: 'rules_count',
      header: 'Rules',
      size: 100,
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      size: 150,
    }
  ];

  const table = useMaterialReactTable({
    columns,
    data,
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip title="Edit" placement="left">
          <IconButton 
            onClick={() => handleEditClick(row)}
            aria-label={`Edit ${row.original.customer_service}`}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete" placement="right">
          <IconButton 
            color="error" 
            onClick={() => handleDeleteClick(row)}
            aria-label={`Delete ${row.original.customer_service}`}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="h6">Rule Groups</Typography>
        <Button
          color="primary"
          onClick={handleCreateClick}
          startIcon={<AddIcon />}
          variant="contained"
          disabled={isLoading}
          aria-label="Create new rule group"
        >
          Create New Group
        </Button>
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
        No rule groups found
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

      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="rule-group-form-title"
      >
        <DialogTitle id="rule-group-form-title">
          {selectedGroup ? 'Edit Rule Group' : 'Create Rule Group'}
        </DialogTitle>
        <RuleGroupForm
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveGroup}
          initialData={selectedGroup}
        />
      </Dialog>
    </Box>
  );
};

export default RuleGroupsList;