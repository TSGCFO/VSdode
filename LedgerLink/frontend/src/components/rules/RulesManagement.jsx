import React from 'react';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Container,
} from '@mui/material';
import RuleGroupsList from './RuleGroupsList';
import BasicRulesList from './BasicRulesList';
import AdvancedRulesList from './AdvancedRulesList';
import ErrorBoundary from '../common/ErrorBoundary';

const RulesManagement = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (_event, newValue) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ width: '100%', mt: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom>
            Rules Management
          </Typography>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="rules management tabs"
            >
              <Tab
                label="Rule Groups"
                component={RouterLink}
                to="/rules/groups"
              />
              <Tab
                label="Basic Rules"
                component={RouterLink}
                to="/rules/basic"
              />
              <Tab
                label="Advanced Rules"
                component={RouterLink}
                to="/rules/advanced"
              />
            </Tabs>
          </Box>

          <Box sx={{ mt: 2 }}>
            <ErrorBoundary>
              <Routes>
                <Route path="groups" element={<RuleGroupsList />} />
                <Route path="basic" element={<BasicRulesList />} />
                <Route path="advanced" element={<AdvancedRulesList />} />
                <Route
                  path="*"
                  element={
                    <Box sx={{ p: 3 }}>
                      <Typography>Select a tab to manage rules</Typography>
                    </Box>
                  }
                />
              </Routes>
            </ErrorBoundary>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RulesManagement;