/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Button,
  Alert,
  Snackbar,
  Grid,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
} from '@mui/icons-material';
import { MaterialReactTable } from 'material-react-table';
import { useNavigate } from 'react-router-dom';
import { productApi, handleApiError } from '../../utils/apiClient';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchStats();
  }, []);

  const fetchProducts = async (filters = {}) => {
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.stock_status === 'in_stock') params.in_stock = true;
      if (filters.stock_status === 'out_of_stock') params.in_stock = false;
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      
      const response = await productApi.list(params);
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productApi.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const fetchStats = async () => {
    try {
      const response = await productApi.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await productApi.delete(id);
        if (response.success) {
          setSuccessMessage('Product deleted successfully');
          fetchProducts();
          fetchStats();
        }
      } catch (error) {
        setError(handleApiError(error));
      }
    }
  };

  const handleUpdateStock = async (id, quantity, operation) => {
    try {
      const response = await productApi.updateStock(id, quantity, operation);
      if (response.success) {
        setSuccessMessage(`Stock ${operation}ed successfully`);
        fetchProducts();
        fetchStats();
      }
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccessMessage('');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'sku',
        header: 'SKU',
        size: 120,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        size: 200,
      },
      {
        accessorKey: 'category',
        header: 'Category',
        size: 150,
        filterVariant: 'select',
        filterSelectOptions: categories.map(category => ({
          text: category,
          value: category,
        })),
      },
      {
        accessorKey: 'price',
        header: 'Price',
        size: 120,
        Cell: ({ cell }) => formatPrice(cell.getValue()),
        Filter: ({ column }) => (
          <Box sx={{ display: 'flex', gap: 1, p: 1 }}>
            <input
              type="number"
              placeholder="Min"
              onChange={(e) => {
                column.setFilterValue((prev) => [
                  e.target.value,
                  prev?.[1],
                ]);
              }}
              style={{ width: 60 }}
            />
            <input
              type="number"
              placeholder="Max"
              onChange={(e) => {
                column.setFilterValue((prev) => [
                  prev?.[0],
                  e.target.value,
                ]);
              }}
              style={{ width: 60 }}
            />
          </Box>
        ),
      },
      {
        accessorKey: 'stock_quantity',
        header: 'Stock',
        size: 150,
        Cell: ({ row: { original } }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {original.stock_quantity}
            <IconButton
              size="small"
              onClick={() => handleUpdateStock(original.id, 1, 'add')}
              color="primary"
            >
              <AddCircleIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleUpdateStock(original.id, 1, 'subtract')}
              color="error"
              disabled={original.stock_quantity <= 0}
            >
              <RemoveCircleIcon />
            </IconButton>
          </Box>
        ),
        filterVariant: 'select',
        filterSelectOptions: [
          { text: 'In Stock', value: 'in_stock' },
          { text: 'Out of Stock', value: 'out_of_stock' },
        ],
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        size: 120,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue() ? 'Active' : 'Inactive'}
            color={cell.getValue() ? 'success' : 'default'}
            size="small"
          />
        ),
        filterVariant: 'select',
        filterSelectOptions: [
          { text: 'Active', value: true },
          { text: 'Inactive', value: false },
        ],
      },
      {
        id: 'actions',
        header: 'Actions',
        size: 100,
        Cell: ({ row: { original } }) => (
          <Box>
            <IconButton
              onClick={() => navigate(`/products/${original.id}/edit`)}
              color="primary"
              size="small"
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={() => handleDelete(original.id)}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ),
      },
    ],
    [categories, navigate]
  );

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={handleCloseError}
      >
        <Alert onClose={handleCloseError} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
      >
        <Alert onClose={handleCloseSuccess} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

      <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item>
            <Chip
              label={`Total Products: ${stats.total_products || 0}`}
              color="primary"
              variant="outlined"
            />
          </Grid>
          <Grid item>
            <Chip
              label={`Active Products: ${stats.active_products || 0}`}
              color="success"
              variant="outlined"
            />
          </Grid>
          <Grid item>
            <Chip
              label={`Out of Stock: ${stats.out_of_stock || 0}`}
              color="error"
              variant="outlined"
            />
          </Grid>
        </Grid>

        <MaterialReactTable
          columns={columns}
          data={products}
          enableColumnFiltering
          enableGlobalFilter
          enablePagination
          enableSorting
          muiToolbarAlertBannerProps={
            error
              ? {
                  color: 'error',
                  children: error,
                }
              : undefined
          }
          renderTopToolbarCustomActions={() => (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/products/new')}
            >
              New Product
            </Button>
          )}
          muiTableProps={{
            sx: {
              tableLayout: 'fixed',
            },
          }}
          initialState={{
            density: 'compact',
            pagination: { pageSize: 10 },
          }}
        />
      </Paper>
    </Box>
  );
};

export default ProductList;