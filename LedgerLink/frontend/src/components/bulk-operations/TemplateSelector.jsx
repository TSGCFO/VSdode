import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Info as InfoIcon,
  NavigateNext as NavigateNextIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

const TemplateSelector = ({ onSelect }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateInfo, setTemplateInfo] = useState(null);
  const [showTemplateInfo, setShowTemplateInfo] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/v1/bulk-operations/operations/');
      const result = await response.json();

      if (result.success) {
        setTemplates(result.data.templates);
      } else {
        setError(result.error || 'Failed to fetch templates');
      }
    } catch (err) {
      setError('Error loading templates: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = async (template) => {
    try {
      // Fetch template info before selection
      const response = await fetch(`/api/v1/bulk-operations/operations/template-info/${template.type}/`);
      const result = await response.json();

      if (result.success) {
        const templateWithInfo = {
          ...template,
          fields: result.data.fields,
          requiredFields: result.data.requiredFields,
          fieldTypes: result.data.fieldTypes,
          validationRules: result.data.validationRules,
          features: result.data.features,
        };
        setSelectedTemplate(templateWithInfo);
        setTemplateInfo(result.data);
      } else {
        setError(result.error || 'Failed to fetch template information');
      }
    } catch (err) {
      setError('Error loading template information: ' + err.message);
    }
  };

  const handleDownloadTemplate = async (templateType, event) => {
    event.stopPropagation();
    try {
      const response = await fetch(`/api/v1/bulk-operations/download/${templateType}/`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download template');
      }

      // Create a blob from the response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateType}_template.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Error downloading template: ' + err.message);
    }
  };

  const handleNext = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
    }
  };

  const handleShowInfo = (template, event) => {
    event.stopPropagation();
    setShowTemplateInfo(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select a Template
      </Typography>
      <Grid container spacing={2}>
        {templates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.type}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
                bgcolor: selectedTemplate?.type === template.type ? 'action.selected' : 'background.paper',
              }}
              onClick={() => handleTemplateSelect(template)}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" component="div">
                    {template.name}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="View Template Information">
                      <Button
                        size="small"
                        startIcon={<InfoIcon />}
                        onClick={(e) => handleShowInfo(template, e)}
                      >
                        Info
                      </Button>
                    </Tooltip>
                    <Tooltip title="Download Excel Template">
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={(e) => handleDownloadTemplate(template.type, e)}
                      >
                        Template
                      </Button>
                    </Tooltip>
                  </Stack>
                </Box>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {template.description}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  {template.sample_data && (
                    <Chip
                      size="small"
                      icon={<CheckIcon />}
                      label="Sample Data"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {template.validation_enabled && (
                    <Chip
                      size="small"
                      icon={<CheckIcon />}
                      label="Data Validation"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedTemplate && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            endIcon={<NavigateNextIcon />}
            onClick={handleNext}
          >
            Next: Upload File
          </Button>
        </Box>
      )}

      {/* Template Info Dialog */}
      <Dialog
        open={showTemplateInfo}
        onClose={() => setShowTemplateInfo(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTemplate?.name} Template Information
        </DialogTitle>
        <DialogContent>
          {templateInfo && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Features
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                {Object.entries(templateInfo.features).map(([feature, enabled]) => (
                  enabled && (
                    <Chip
                      key={feature}
                      size="small"
                      icon={<CheckIcon />}
                      label={feature.replace(/([A-Z])/g, ' $1').trim()}
                      color="primary"
                      variant="outlined"
                    />
                  )
                ))}
              </Stack>

              <Typography variant="subtitle1" gutterBottom>
                Field Details
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Field Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Required</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Validation</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(templateInfo.validationRules).map(([field, info]) => (
                      <TableRow key={field}>
                        <TableCell>{field}</TableCell>
                        <TableCell>{info.type}</TableCell>
                        <TableCell>{info.required ? 'Yes' : 'No'}</TableCell>
                        <TableCell>{info.description}</TableCell>
                        <TableCell>
                          {info.validation && Object.entries(info.validation).map(([key, value]) => (
                            <Typography key={key} variant="caption" display="block">
                              {key}: {Array.isArray(value) ? value.join(', ') : value}
                            </Typography>
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTemplateInfo(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={(e) => handleDownloadTemplate(selectedTemplate?.type, e)}
          >
            Download Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateSelector;