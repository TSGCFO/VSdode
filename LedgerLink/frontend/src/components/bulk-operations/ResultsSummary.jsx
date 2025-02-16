import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Alert,
  AlertTitle,
  Divider,
  Chip,
  Stack,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

const ResultsSummary = ({ summary, errors, onRetry }) => {
  const [showErrors, setShowErrors] = useState(true);

  const getStatusColor = () => {
    if (!summary) return 'error';
    return summary.failed === 0 ? 'success' : 'warning';
  };

  const getStatusText = () => {
    if (!summary) return 'Import Failed';
    if (summary.failed === 0) return 'Import Successful';
    return 'Import Completed with Errors';
  };

  const getSuccessRate = () => {
    if (!summary || summary.total_rows === 0) return 0;
    return (summary.successful / summary.total_rows) * 100;
  };

  const onDownloadTemplate = async () => {
    try {
      const response = await fetch(`/api/v1/bulk-operations/download/${summary.template_type}/`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${summary.template_type}_template.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading template:', err);
    }
  };

  const renderSummaryCard = (title, value, icon, color, subtitle = null) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={1}>
          {icon}
          <Typography variant="h6" component="div" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" color={color}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const renderError = (error, index) => {
    if (typeof error === 'string') {
      return (
        <ListItem key={index}>
          <ListItemIcon>
            <ErrorIcon color="error" />
          </ListItemIcon>
          <ListItemText primary={error} />
        </ListItem>
      );
    }

    const { row, errors: errorDetails } = error;
    const hasMultipleErrors = Object.keys(errorDetails).length > 1;

    return (
      <Accordion key={index}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" width="100%">
            <ErrorIcon color="error" sx={{ mr: 1 }} />
            <Typography>Row {row}</Typography>
            <Box ml="auto">
              <Chip
                size="small"
                label={`${Object.keys(errorDetails).length} ${
                  hasMultipleErrors ? 'errors' : 'error'
                }`}
                color="error"
                variant="outlined"
              />
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {Object.entries(errorDetails).map(([field, fieldErrors], fieldIndex) => (
              <ListItem key={fieldIndex}>
                <ListItemIcon>
                  <InfoIcon color="info" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={field}
                  secondary={Array.isArray(fieldErrors) ? fieldErrors.join(', ') : fieldErrors}
                />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Import Results
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          {getStatusColor() === 'success' ? (
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
          ) : getStatusColor() === 'warning' ? (
            <WarningIcon color="warning" sx={{ mr: 1 }} />
          ) : (
            <ErrorIcon color="error" sx={{ mr: 1 }} />
          )}
          <Typography variant="h5" color={`${getStatusColor()}.main`}>
            {getStatusText()}
          </Typography>
        </Box>

        {summary && (
          <>
            <Box mb={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Success Rate
              </Typography>
              <Box display="flex" alignItems="center">
                <Box flexGrow={1} mr={2}>
                  <LinearProgress
                    variant="determinate"
                    value={getSuccessRate()}
                    color={getSuccessRate() === 100 ? 'success' : 'warning'}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {getSuccessRate().toFixed(1)}%
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} sm={4}>
                {renderSummaryCard(
                  'Total Rows',
                  summary.total_rows,
                  <AssessmentIcon color="primary" />,
                  'primary.main',
                  'Total records in file'
                )}
              </Grid>
              <Grid item xs={12} sm={4}>
                {renderSummaryCard(
                  'Successful',
                  summary.successful,
                  <CheckCircleIcon color="success" />,
                  'success.main',
                  'Records imported successfully'
                )}
              </Grid>
              <Grid item xs={12} sm={4}>
                {renderSummaryCard(
                  'Failed',
                  summary.failed,
                  <ErrorIcon color="error" />,
                  'error.main',
                  'Records with errors'
                )}
              </Grid>
            </Grid>

            {summary.failed > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <AlertTitle>Import Completed with Errors</AlertTitle>
                Some records failed to import. Please review the errors below, correct the data in the Excel template,
                and try importing again. Use the template's data validation features to prevent common errors.
              </Alert>
            )}

            {summary.failed === 0 && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <AlertTitle>Import Successful</AlertTitle>
                All records were imported successfully. The data met all validation requirements and has been
                saved to the database.
              </Alert>
            )}
          </>
        )}

        {errors && errors.length > 0 && (
          <Box>
            <Button
              startIcon={showErrors ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setShowErrors(!showErrors)}
              sx={{ mb: 1 }}
            >
              {showErrors ? 'Hide' : 'Show'} Error Details ({errors.length})
            </Button>
            <Collapse in={showErrors}>
              <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
                <List dense disablePadding>
                  {errors.map((error, index) => renderError(error, index))}
                </List>
              </Paper>
            </Collapse>
          </Box>
        )}

        <Box mt={3}>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
              color="primary"
            >
              Upload Another File
            </Button>
            {errors && errors.length > 0 && (
              <Tooltip title="Download the template and correct the errors">
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={onDownloadTemplate}
                  color="primary"
                >
                  Download Template
                </Button>
              </Tooltip>
            )}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default ResultsSummary;