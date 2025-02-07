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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import rulesService from '../../services/rulesService';
import RuleValidator from './core/RuleValidator';
import RuleBuilder from './RuleBuilder';
import { LOGIC_OPERATOR_OPTIONS } from './constants';

const RuleGroupsList = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRuleBuilderOpen, setIsRuleBuilderOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedRule, setSelectedRule] = useState(null);
  const [formData, setFormData] = useState({
    customer_service: '',
    logic_operator: 'AND',
    rules: []
  });
  const [customerServices, setCustomerServices] = useState([]);

  // Fetch rule groups data
  const fetchRuleGroups = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await rulesService.getRuleGroups();
      setData(Array.isArray(response) ? response : []);
    } catch (err) {
      setError('Failed to fetch rule groups');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch customer services
  const fetchCustomerServices = useCallback(async () => {
    try {
      const response = await rulesService.getCustomerServices();
      const services = Array.isArray(response) ? response : [];
      // Sort services by company name and service name
      const sortedServices = services.sort((a, b) => {
        const companyA = a.customer?.company_name || '';
        const companyB = b.customer?.company_name || '';
        const serviceA = a.service?.service_name || '';
        const serviceB = b.service?.service_name || '';
        
        // First sort by company name
        if (companyA < companyB) return -1;
        if (companyA > companyB) return 1;
        
        // If company names are equal, sort by service name
        if (serviceA < serviceB) return -1;
        if (serviceA > serviceB) return 1;
        
        return 0;
      });
      setCustomerServices(sortedServices);
    } catch (err) {
      console.error('Failed to fetch customer services:', err);
      setError('Failed to load customer services');
    }
  }, []);

  useEffect(() => {
    fetchRuleGroups();
    fetchCustomerServices();
  }, [fetchRuleGroups, fetchCustomerServices]);

  const handleCreateClick = () => {
    setSelectedGroup(null);
    setFormData({
      customer_service: '',
      logic_operator: 'AND',
      rules: []
    });
    setIsDialogOpen(true);
  };

  const handleEditClick = useCallback((row) => {
    setSelectedGroup(row.original);
    setFormData({
      customer_service: row.original.customer_service,
      logic_operator: row.original.logic_operator,
      rules: row.original.rules || []
    });
    setIsDialogOpen(true);
  }, []);

  const handleDeleteClick = useCallback(async (row) => {
    try {
      if (!row.original.id) {
        throw new Error('Rule group ID is required');
      }
      setError(null);
      setIsLoading(true);
      await rulesService.deleteRuleGroup(row.original.id);
      await fetchRuleGroups();
    } catch (err) {
      setError('Failed to delete rule group');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchRuleGroups]);

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedGroup(null);
    setFormData({
      customer_service: '',
      logic_operator: 'AND',
      rules: []
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.customer_service) {
        throw new Error('Customer service is required');
      }

      setError(null);
      setIsLoading(true);

      const ruleGroup = {
        ...formData,
        rules: formData.rules || []
      };

      if (selectedGroup?.id) {
        await rulesService.updateRuleGroup(selectedGroup.id, ruleGroup);
      } else {
        await rulesService.createRuleGroup(ruleGroup);
      }

      await fetchRuleGroups();
      handleDialogClose();
    } catch (err) {
      setError(err.message || `Failed to ${selectedGroup ? 'update' : 'create'} rule group`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerServiceChange = (event) => {
    setFormData(prev => ({
      ...prev,
      customer_service: event.target.value
    }));
  };

  const handleLogicOperatorChange = (event) => {
    setFormData(prev => ({
      ...prev,
      logic_operator: event.target.value
    }));
  };

  const handleAddRule = () => {
    setSelectedRule(null);
    setIsRuleBuilderOpen(true);
  };

  const handleEditRule = (rule) => {
    setSelectedRule(rule);
    setIsRuleBuilderOpen(true);
  };

  const handleDeleteRule = (ruleToDelete) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules?.filter(rule => rule !== ruleToDelete) || []
    }));
  };

  const handleRuleSave = (rule) => {
    setFormData(prev => {
      const rules = prev.rules || [];
      if (selectedRule) {
        // Update existing rule
        const index = rules.indexOf(selectedRule);
        if (index !== -1) {
          const newRules = [...rules];
          newRules[index] = rule;
          return { ...prev, rules: newRules };
        }
      }
      // Add new rule
      return { ...prev, rules: [...rules, rule] };
    });
    setIsRuleBuilderOpen(false);
    setSelectedRule(null);
  };

  const getCustomerServiceName = useCallback((id) => {
    if (!id) return '';
    const service = customerServices.find(s => s.id === id);
    if (!service) return '';
    return `${service.customer?.company_name || ''} - ${service.service?.service_name || ''}`;
  }, [customerServices]);

  const getLogicOperatorLabel = useCallback((value) => {
    const operator = LOGIC_OPERATOR_OPTIONS.find(op => op.value === value);
    return operator ? operator.label : value;
  }, []);

  const columns = React.useMemo(
    () => [
      {
        accessorKey: 'customer_service',
        header: 'Customer Service',
        size: 300,
        Cell: ({ row }) => getCustomerServiceName(row.original.customer_service),
      },
      {
        accessorKey: 'logic_operator',
        header: 'Logic',
        size: 200,
        Cell: ({ row }) => getLogicOperatorLabel(row.original.logic_operator),
      },
      {
        accessorKey: 'rules',
        header: 'Rules',
        size: 100,
        Cell: ({ row }) => {
          const rules = row.original.rules || [];
          const basicRules = rules.filter(r => !('conditions' in r)).length;
          const advancedRules = rules.filter(r => 'conditions' in r).length;
          return `${basicRules + advancedRules} (${basicRules}/${advancedRules})`;
        },
      }
    ],
    [getCustomerServiceName, getLogicOperatorLabel]
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
            aria-label={`Edit rule group for ${getCustomerServiceName(row.original.customer_service)}`}
            disabled={isLoading}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete" placement="right">
          <IconButton 
            color="error" 
            onClick={() => handleDeleteClick(row)}
            aria-label={`Delete rule group for ${getCustomerServiceName(row.original.customer_service)}`}
            disabled={isLoading}
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
        >
          Create Group
        </Button>
      </Box>
    ),
    muiTableBodyRowProps: { hover: true },
    initialState: {
      pagination: { pageSize: 10, pageIndex: 0 },
      sorting: [{ id: 'customer_service', desc: false }],
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

      {/* Create/Edit Rule Group Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleFormSubmit}>
          <DialogTitle>
            {selectedGroup ? 'Edit Rule Group' : 'Create Rule Group'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <FormControl fullWidth required>
                <InputLabel id="customer-service-label">Customer Service</InputLabel>
                <Select
                  labelId="customer-service-label"
                  name="customer_service"
                  value={formData.customer_service}
                  onChange={handleCustomerServiceChange}
                  label="Customer Service"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300
                      }
                    }
                  }}
                >
                  {customerServices.map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      {`${service.customer?.company_name || ''} - ${service.service?.service_name || ''}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth required>
                <InputLabel id="logic-operator-label">Logic Operator</InputLabel>
                <Select
                  labelId="logic-operator-label"
                  name="logic_operator"
                  value={formData.logic_operator}
                  onChange={handleLogicOperatorChange}
                  label="Logic Operator"
                >
                  {LOGIC_OPERATOR_OPTIONS.map((operator) => (
                    <MenuItem key={operator.value} value={operator.value}>
                      {operator.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="subtitle1" sx={{ mt: 2 }}>Rules</Typography>
              <List>
                {formData.rules?.map((rule, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${rule.field} ${rule.operator} ${rule.value}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleEditRule(rule)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteRule(rule)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddRule}
                variant="outlined"
              >
                Add Rule
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} disabled={isLoading}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={isLoading || !formData.customer_service}
            >
              {selectedGroup ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Rule Builder Dialog */}
      <Dialog
        open={isRuleBuilderOpen}
        onClose={() => setIsRuleBuilderOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <RuleBuilder
          initialRule={selectedRule}
          onSave={handleRuleSave}
          onClose={() => setIsRuleBuilderOpen(false)}
        />
      </Dialog>
    </Box>
  );
};

export default RuleGroupsList;