import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { orderApi, customerApi, handleApiError } from '../../utils/apiClient';

const OrderForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    customer: '',
    reference_number: '',
    status: 'draft',
    priority: 'medium',
    ship_to_name: '',
    ship_to_company: '',
    ship_to_address: '',
    ship_to_address2: '',
    ship_to_city: '',
    ship_to_state: '',
    ship_to_zip: '',
    ship_to_country: '',
    weight_lb: '',
    sku_quantity: {},
    notes: '',
    carrier: ''
  });

  const [customers, setCustomers] = useState([]);
  const [statusChoices, setStatusChoices] = useState([]);
  const [priorityChoices, setPriorityChoices] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchChoices();
    if (isEditMode) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderApi.get(id);
      if (response.success) {
        setFormData({
          ...response.data,
          weight_lb: response.data.weight_lb || '',
          sku_quantity: response.data.sku_quantity || {}
        });
      }
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customerApi.list();
      if (response.success) {
        setCustomers(response.data);
      }
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const fetchChoices = async () => {
    try {
      const response = await orderApi.getChoices();
      if (response.success) {
        setStatusChoices(response.data.status_choices);
        setPriorityChoices(response.data.priority_choices);
      }
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customer) {
      newErrors.customer = 'Customer is required';
    }
    
    if (!formData.reference_number) {
      newErrors.reference_number = 'Reference number is required';
    }

    // Validate shipping fields if any are filled
    const shippingFields = [
      'ship_to_name',
      'ship_to_address',
      'ship_to_city',
      'ship_to_state',
      'ship_to_zip'
    ];
    
    const hasShippingInfo = shippingFields.some(field => formData[field]);
    if (hasShippingInfo) {
      shippingFields.forEach(field => {
        if (!formData[field]) {
          newErrors[field] = 'Required for shipping';
        }
      });
    }

    // Validate SKU quantities
    if (Object.keys(formData.sku_quantity).length === 0) {
      newErrors.sku_quantity = 'At least one SKU is required';
    } else {
      Object.entries(formData.sku_quantity).forEach(([sku, qty]) => {
        if (!qty || qty <= 0) {
          newErrors.sku_quantity = 'All quantities must be positive numbers';
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSkuChange = (sku, value) => {
    setFormData(prev => ({
      ...prev,
      sku_quantity: {
        ...prev.sku_quantity,
        [sku]: parseInt(value) || 0
      }
    }));
    if (errors.sku_quantity) {
      setErrors(prev => ({
        ...prev,
        sku_quantity: null
      }));
    }
  };

  const addSkuField = () => {
    setFormData(prev => ({
      ...prev,
      sku_quantity: {
        ...prev.sku_quantity,
        '': 0
      }
    }));
  };

  const removeSkuField = (sku) => {
    const newSkuQuantity = { ...formData.sku_quantity };
    delete newSkuQuantity[sku];
    setFormData(prev => ({
      ...prev,
      sku_quantity: newSkuQuantity
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const apiCall = isEditMode
        ? () => orderApi.update(id, formData)
        : () => orderApi.create(formData);

      const response = await apiCall();

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/orders');
        }, 1500);
      }
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  if (loading && isEditMode) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={handleCloseError}
      >
        <Alert onClose={handleCloseError} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {isEditMode ? 'Edit Order' : 'New Order'}
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Order {isEditMode ? 'updated' : 'created'} successfully!
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={Boolean(errors.customer)}>
                <InputLabel>Customer</InputLabel>
                <Select
                  name="customer"
                  value={formData.customer}
                  onChange={handleChange}
                  label="Customer"
                >
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.company_name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.customer && (
                  <Typography color="error" variant="caption">
                    {errors.customer}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Reference Number"
                name="reference_number"
                value={formData.reference_number}
                onChange={handleChange}
                error={Boolean(errors.reference_number)}
                helperText={errors.reference_number}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  {statusChoices.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Priority"
                >
                  {priorityChoices.map((priority) => (
                    <MenuItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Shipping Information
                </Typography>
              </Divider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ship to Name"
                name="ship_to_name"
                value={formData.ship_to_name}
                onChange={handleChange}
                error={Boolean(errors.ship_to_name)}
                helperText={errors.ship_to_name}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ship to Company"
                name="ship_to_company"
                value={formData.ship_to_company}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="ship_to_address"
                value={formData.ship_to_address}
                onChange={handleChange}
                error={Boolean(errors.ship_to_address)}
                helperText={errors.ship_to_address}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 2"
                name="ship_to_address2"
                value={formData.ship_to_address2}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="ship_to_city"
                value={formData.ship_to_city}
                onChange={handleChange}
                error={Boolean(errors.ship_to_city)}
                helperText={errors.ship_to_city}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                name="ship_to_state"
                value={formData.ship_to_state}
                onChange={handleChange}
                error={Boolean(errors.ship_to_state)}
                helperText={errors.ship_to_state}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="ship_to_zip"
                value={formData.ship_to_zip}
                onChange={handleChange}
                error={Boolean(errors.ship_to_zip)}
                helperText={errors.ship_to_zip}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                name="ship_to_country"
                value={formData.ship_to_country}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Order Details
                </Typography>
              </Divider>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  SKUs and Quantities
                  <IconButton
                    size="small"
                    onClick={addSkuField}
                    sx={{ ml: 1 }}
                  >
                    <AddIcon />
                  </IconButton>
                </Typography>
                {errors.sku_quantity && (
                  <Typography color="error" variant="caption" display="block" sx={{ mb: 1 }}>
                    {errors.sku_quantity}
                  </Typography>
                )}
                {Object.entries(formData.sku_quantity).map(([sku, qty], index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      label="SKU"
                      value={sku}
                      onChange={(e) => {
                        const newSkuQuantity = { ...formData.sku_quantity };
                        const oldQty = newSkuQuantity[sku];
                        delete newSkuQuantity[sku];
                        newSkuQuantity[e.target.value] = oldQty;
                        setFormData(prev => ({
                          ...prev,
                          sku_quantity: newSkuQuantity
                        }));
                      }}
                      sx={{ flex: 2 }}
                    />
                    <TextField
                      type="number"
                      label="Quantity"
                      value={qty}
                      onChange={(e) => handleSkuChange(sku, e.target.value)}
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeSkuField(sku)}
                      sx={{ mt: 1 }}
                    >
                      <RemoveIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Weight (lbs)"
                name="weight_lb"
                value={formData.weight_lb}
                onChange={handleChange}
                inputProps={{ step: "0.1", min: "0" }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Carrier"
                name="carrier"
                value={formData.carrier}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/orders')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    isEditMode ? 'Update Order' : 'Create Order'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default OrderForm;