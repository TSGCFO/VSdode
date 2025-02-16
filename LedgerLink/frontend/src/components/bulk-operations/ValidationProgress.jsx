import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const ValidationProgress = ({ progress, errors, isProcessing, validationStage }) => {
  const getStatusColor = () => {
    if (isProcessing) return 'primary';
    return errors.length > 0 ? 'error' : 'success';
  };

  const getStatusText = () => {
    if (isProcessing) {
      switch (validationStage) {
        case 'structure':
          return 'Validating template structure...';
        case 'data':
          return 'Validating data...';
        case 'processing':
          return 'Processing records...';
        default:
          return 'Validating...';
      }
    }
    return errors.length > 0 ? 'Validation Failed' : 'Validation Complete';
  };

  const getStageProgress = () => {
    switch (validationStage) {
      case 'structure':
        return Math.min(progress, 30);
      case 'data':
        return 30 + Math.min(progress * 0.4, 40);
      case 'processing':
        return 70 + Math.min(progress * 0.3, 30);
      default:
        return progress;
    }
  };

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
      <Accordion key={index} sx={{ width: '100%' }}>
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
        File Validation
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          {isProcessing ? (
            <CircularProgress size={24} sx={{ mr: 2 }} />
          ) : (
            <Box sx={{ mr: 2 }}>
              {errors.length > 0 ? (
                <ErrorIcon color="error" />
              ) : (
                <CheckCircleIcon color="success" />
              )}
            </Box>
          )}
          <Typography variant="subtitle1" color={getStatusColor()}>
            {getStatusText()}
          </Typography>
        </Box>

        <Stack spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Template Structure
            </Typography>
            <LinearProgress
              variant="determinate"
              value={validationStage === 'structure' ? progress : 100}
              color={validationStage === 'structure' ? 'primary' : 'success'}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Data Validation
            </Typography>
            <LinearProgress
              variant="determinate"
              value={validationStage === 'data' ? progress : (validationStage === 'processing' ? 100 : 0)}
              color={validationStage === 'data' ? 'primary' : 'success'}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Processing
            </Typography>
            <LinearProgress
              variant="determinate"
              value={validationStage === 'processing' ? progress : 0}
              color={validationStage === 'processing' ? 'primary' : 'success'}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        </Stack>

        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="body2" color="text.secondary">
            Overall Progress: {getStageProgress()}%
          </Typography>
          {errors.length > 0 && (
            <Typography variant="body2" color="error">
              {errors.length} {errors.length === 1 ? 'Error' : 'Errors'} Found
            </Typography>
          )}
        </Box>

        {isProcessing && (
          <Box mb={2}>
            <Alert severity="info">
              {validationStage === 'structure' && 'Validating template structure and checking required fields...'}
              {validationStage === 'data' && 'Validating data formats and field constraints...'}
              {validationStage === 'processing' && 'Processing records and saving to database...'}
            </Alert>
          </Box>
        )}

        {!isProcessing && errors.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom color="error">
              Validation Errors:
            </Typography>
            <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
              <List dense disablePadding>
                {errors.map((error, index) => renderError(error, index))}
              </List>
            </Paper>
            <Alert severity="warning" sx={{ mt: 2 }}>
              Please correct these errors in the Excel template and try uploading again.
              Make sure to use the data validation features in Excel to prevent common errors.
            </Alert>
          </Box>
        )}

        {!isProcessing && errors.length === 0 && progress === 100 && (
          <Alert severity="success">
            Validation successful! All data meets the required format and constraints.
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default ValidationProgress;