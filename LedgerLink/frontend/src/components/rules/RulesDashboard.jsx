import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import RuleGroupsList from './RuleGroupsList';
import BasicRulesList from './BasicRulesList';
import AdvancedRulesList from './AdvancedRulesList';
import RuleGroupForm from './RuleGroupForm';
import rulesService from '../../services/rulesService';

const RulesDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [ruleGroups, setRuleGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGroupForm, setShowGroupForm] = useState(false);

  useEffect(() => {
    fetchRuleGroups();
  }, []);

  const fetchRuleGroups = async () => {
    try {
      setLoading(true);
      const groups = await rulesService.getRuleGroups();
      setRuleGroups(groups);
      setError(null);
    } catch (err) {
      setError('Failed to fetch rule groups. Please try again.');
      console.error('Error fetching rule groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
  };

  const handleGroupCreate = async (groupData) => {
    try {
      await rulesService.createRuleGroup(groupData);
      await fetchRuleGroups();
      setShowGroupForm(false);
    } catch (err) {
      setError('Failed to create rule group. Please try again.');
      console.error('Error creating rule group:', err);
    }
  };

  const handleGroupUpdate = async (id, groupData) => {
    try {
      await rulesService.updateRuleGroup(id, groupData);
      await fetchRuleGroups();
    } catch (err) {
      setError('Failed to update rule group. Please try again.');
      console.error('Error updating rule group:', err);
    }
  };

  const handleGroupDelete = async (id) => {
    try {
      await rulesService.deleteRuleGroup(id);
      await fetchRuleGroups();
      setSelectedGroup(null);
    } catch (err) {
      setError('Failed to delete rule group. Please try again.');
      console.error('Error deleting rule group:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Rules Management
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Rule Groups" />
          <Tab label="Basic Rules" disabled={!selectedGroup} />
          <Tab label="Advanced Rules" disabled={!selectedGroup} />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Box>
          <RuleGroupsList
            groups={ruleGroups}
            onSelect={handleGroupSelect}
            onUpdate={handleGroupUpdate}
            onDelete={handleGroupDelete}
            onCreateNew={() => setShowGroupForm(true)}
          />
          {showGroupForm && (
            <RuleGroupForm
              onSubmit={handleGroupCreate}
              onCancel={() => setShowGroupForm(false)}
            />
          )}
        </Box>
      )}

      {activeTab === 1 && selectedGroup && (
        <BasicRulesList groupId={selectedGroup.id} />
      )}

      {activeTab === 2 && selectedGroup && (
        <AdvancedRulesList groupId={selectedGroup.id} />
      )}
    </Container>
  );
};

export default RulesDashboard;