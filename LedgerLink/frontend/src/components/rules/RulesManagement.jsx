import React, { useState, Suspense } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Container,
  Paper,
  AppBar,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  DialogTitle,
  CircularProgress,
  DialogActions,
  Button
} from '@mui/material';
import {
  Add as AddIcon,
  Build as BuildIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';
import ErrorBoundary from '../common/ErrorBoundary';

// Lazy load components to improve initial load time
const RuleWizard = React.lazy(() => import('./RuleWizard'));
const RuleGroupsList = React.lazy(() => import('./RuleGroupsList'));
const BasicRulesList = React.lazy(() => import('./BasicRulesList'));
const AdvancedRulesList = React.lazy(() => import('./AdvancedRulesList'));
const AdvancedRuleBuilder = React.lazy(() => import('./AdvancedRuleBuilder'));
const RulePreview = React.lazy(() => import('./RulePreview'));

// Loading fallback component
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
    <CircularProgress />
  </Box>
);

// Custom TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      id={`rules-tabpanel-${index}`}
      aria-labelledby={`rules-tab-${index}`}
      {...other}
      inert={value !== index ? '' : undefined}
      style={{ display: value === index ? 'block' : 'none' }}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `rules-tab-${index}`,
    'aria-controls': `rules-tabpanel-${index}`,
  };
}

const RulesManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isAdvancedBuilderOpen, setIsAdvancedBuilderOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCloseWizard = () => {
    setIsWizardOpen(false);
  };

  const handleSaveRule = async (ruleData) => {
    try {
      // Handle saving the rule data
      console.log('Saving rule:', ruleData);
      // TODO: Make API call to save rule
      handleCloseWizard();
    } catch (error) {
      console.error('Error saving rule:', error);
    }
  };

  const handleSaveAdvancedRule = async (ruleData) => {
    try {
      // Handle saving the advanced rule data
      console.log('Saving advanced rule:', ruleData);
      // TODO: Make API call to save advanced rule
      setIsAdvancedBuilderOpen(false);
    } catch (error) {
      console.error('Error saving advanced rule:', error);
    }
  };

  const handleError = () => {
    // Reset any necessary state when an error occurs
    setIsWizardOpen(false);
    setIsAdvancedBuilderOpen(false);
    setIsPreviewOpen(false);
  };

  return (
    <ErrorBoundary onReset={handleError}>
      <Container maxWidth="xl">
        <Box sx={{ width: '100%', mb: 4 }}>
          <Paper elevation={3}>
            <AppBar position="static" color="default" elevation={0}>
              <Box sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  indicatorColor="primary"
                  textColor="primary"
                  sx={{ flexGrow: 1 }}
                  aria-label="Rule management tabs"
                >
                  <Tab label="Rule Groups" {...a11yProps(0)} />
                  <Tab label="Basic Rules" {...a11yProps(1)} />
                  <Tab label="Advanced Rules" {...a11yProps(2)} />
                </Tabs>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Add New Rule">
                    <IconButton
                      color="primary"
                      onClick={() => setIsWizardOpen(true)}
                      aria-label="Add new rule"
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Advanced Builder">
                    <IconButton 
                      color="primary"
                      onClick={() => setIsAdvancedBuilderOpen(true)}
                      aria-label="Open advanced builder"
                    >
                      <BuildIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Preview Rules">
                    <IconButton 
                      color="primary"
                      onClick={() => setIsPreviewOpen(true)}
                      aria-label="Preview rules"
                    >
                      <PreviewIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </AppBar>

            {/* Rule Groups Tab */}
            <TabPanel value={activeTab} index={0}>
              <ErrorBoundary onReset={handleError}>
                <Suspense fallback={<LoadingFallback />}>
                  <RuleGroupsList />
                </Suspense>
              </ErrorBoundary>
            </TabPanel>

            {/* Basic Rules Tab */}
            <TabPanel value={activeTab} index={1}>
              <ErrorBoundary onReset={handleError}>
                <Suspense fallback={<LoadingFallback />}>
                  <BasicRulesList />
                </Suspense>
              </ErrorBoundary>
            </TabPanel>

            {/* Advanced Rules Tab */}
            <TabPanel value={activeTab} index={2}>
              <ErrorBoundary onReset={handleError}>
                <Suspense fallback={<LoadingFallback />}>
                  <AdvancedRulesList />
                </Suspense>
              </ErrorBoundary>
            </TabPanel>
          </Paper>
        </Box>

        {/* Rule Creation Wizard Dialog */}
        <Dialog
          open={isWizardOpen}
          onClose={handleCloseWizard}
          maxWidth="md"
          fullWidth
          aria-labelledby="rule-wizard-title"
          keepMounted={false}
        >
          <DialogTitle id="rule-wizard-title">Create New Rule</DialogTitle>
          <DialogContent>
            <ErrorBoundary onReset={() => setIsWizardOpen(false)}>
              <Suspense fallback={<LoadingFallback />}>
                <RuleWizard
                  onClose={handleCloseWizard}
                  onSave={handleSaveRule}
                />
              </Suspense>
            </ErrorBoundary>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseWizard}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* Advanced Rule Builder Dialog */}
        <Dialog
          open={isAdvancedBuilderOpen}
          onClose={() => setIsAdvancedBuilderOpen(false)}
          maxWidth="lg"
          fullWidth
          aria-labelledby="advanced-builder-title"
          keepMounted={false}
        >
          <DialogTitle id="advanced-builder-title">Advanced Rule Builder</DialogTitle>
          <DialogContent>
            <ErrorBoundary onReset={() => setIsAdvancedBuilderOpen(false)}>
              <Suspense fallback={<LoadingFallback />}>
                <AdvancedRuleBuilder
                  onClose={() => setIsAdvancedBuilderOpen(false)}
                  onSave={handleSaveAdvancedRule}
                />
              </Suspense>
            </ErrorBoundary>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAdvancedBuilderOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* Rule Preview Dialog */}
        <Dialog
          open={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          maxWidth="lg"
          fullWidth
          aria-labelledby="rule-preview-title"
          keepMounted={false}
        >
          <DialogTitle id="rule-preview-title">Rule Preview</DialogTitle>
          <DialogContent>
            <ErrorBoundary onReset={() => setIsPreviewOpen(false)}>
              <Suspense fallback={<LoadingFallback />}>
                <RulePreview
                  onClose={() => setIsPreviewOpen(false)}
                />
              </Suspense>
            </ErrorBoundary>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsPreviewOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ErrorBoundary>
  );
};

export default RulesManagement;