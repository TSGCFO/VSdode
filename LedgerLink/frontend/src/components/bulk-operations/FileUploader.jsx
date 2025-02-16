import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Description as FileIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

const FileUploader = ({ selectedTemplate, onFileSelect, error }) => {
  const [dragActive, setDragActive] = useState(false);
  const [validating, setValidating] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [clientValidationErrors, setClientValidationErrors] = useState([]);
  const [showTemplateInfo, setShowTemplateInfo] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = async (file) => {
    setValidating(true);
    setClientValidationErrors([]);
    const errors = [];

    // Size validation
    if (file.size > 10 * 1024 * 1024) {
      errors.push('File size exceeds 10MB limit');
    }

    // Format validation
    const extension = file.name.split('.').pop().toLowerCase();
    if (extension !== 'xlsx') {
      errors.push('Please use the Excel template provided (.xlsx format)');
    }

    setValidating(false);
    setClientValidationErrors(errors);

    if (errors.length === 0) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await validateFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await validateFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(`/api/v1/bulk-operations/download/${selectedTemplate.type}/`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplate.type}_template.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading template:', err);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          Upload {selectedTemplate.name} File
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadTemplate}
        >
          Download Template
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Template Features:
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          {selectedTemplate.features && Object.entries(selectedTemplate.features).map(([feature, enabled]) => (
            enabled && (
              <Chip
                key={feature}
                size="small"
                icon={<CheckCircleIcon />}
                label={feature.replace(/([A-Z])/g, ' $1').trim()}
                color="primary"
                variant="outlined"
              />
            )
          ))}
        </Stack>
      </Alert>

      <Paper
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'grey.300',
          bgcolor: dragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          mb: 3,
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          onChange={handleChange}
          style={{ display: 'none' }}
        />

        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          {validating ? (
            <CircularProgress sx={{ mb: 2 }} />
          ) : (
            <CloudUploadIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
          )}

          <Typography variant="h6" gutterBottom>
            {validating
              ? 'Validating file...'
              : 'Drag and drop your file here or click to browse'}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Excel files only (.xlsx) - Max 10MB
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please use the template provided for correct data structure and validation
          </Typography>
        </Box>
      </Paper>

      {selectedFile && (
        <Box mt={2}>
          <List>
            <ListItem>
              <ListItemIcon>
                <FileIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={selectedFile.name}
                secondary={`${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`}
              />
              <CheckCircleIcon color="success" />
            </ListItem>
          </List>
        </Box>
      )}

      {clientValidationErrors.length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Validation Errors:
          </Typography>
          <List dense>
            {clientValidationErrors.map((error, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <ErrorIcon color="error" />
                </ListItemIcon>
                <ListItemText primary={error} />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Box mt={3}>
        <Typography variant="subtitle2" gutterBottom>
          Important Notes:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <InfoIcon color="info" />
            </ListItemIcon>
            <ListItemText primary="Use the provided Excel template for correct data structure" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <InfoIcon color="info" />
            </ListItemIcon>
            <ListItemText primary="The template includes data validation and sample data" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <InfoIcon color="info" />
            </ListItemIcon>
            <ListItemText primary="Required fields are marked with an asterisk (*)" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <InfoIcon color="info" />
            </ListItemIcon>
            <ListItemText primary="Maximum 1000 rows per import" />
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default FileUploader;