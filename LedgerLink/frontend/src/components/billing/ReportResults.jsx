import React from 'react';
import { Box, Button, Grid, Typography, Alert } from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const ReportResults = ({ report, onExport, loading }) => {
  if (!report) {
    return null;
  }

  const formatCurrency = (amount) => {
    if (amount == null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount) || 0);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (err) {
      console.error('Date formatting error:', err);
      return dateString;
    }
  };

  const columns = [
    {
      accessorKey: 'order_id',
      header: 'Order ID',
      size: 100,
    },
    {
      accessorKey: 'services',
      header: 'Services',
      size: 400,
      Cell: ({ row }) => {
        const services = row.original.services || [];
        return (
          <Box>
            {services.map((service, index) => (
              <div key={`${row.original.order_id}-${service.service_id || index}`}>
                {service.service_name}: {formatCurrency(service.amount)}
              </div>
            ))}
          </Box>
        );
      },
    },
    {
      accessorKey: 'total_amount',
      header: 'Total',
      size: 150,
      Cell: ({ cell }) => formatCurrency(cell.getValue()),
    },
  ];

  const renderServiceTotals = () => {
    const serviceTotals = Array.isArray(report.service_totals) 
      ? report.service_totals 
      : Object.entries(report.service_totals || {}).map(([id, data]) => ({
          service_id: id,
          service_name: data.name,
          total_amount: data.amount
        }));

    if (!serviceTotals || serviceTotals.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
          No service totals available
        </Alert>
      );
    }

    // Group services into rows of 3
    const rows = [];
    for (let i = 0; i < serviceTotals.length; i += 3) {
      rows.push(serviceTotals.slice(i, i + 3));
    }

    return rows.map((row, rowIndex) => (
      <Grid container spacing={2} key={rowIndex} sx={{ mb: 2 }}>
        {row.map((service) => (
          <Grid item xs={12} sm={4} key={service.service_id || `service-${rowIndex}`}>
            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                {service.service_name || 'Unknown Service'}
              </Typography>
              <Typography variant="h6">
                {formatCurrency(service.total_amount)}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    ));
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="textSecondary">
              Total Amount
            </Typography>
            <Typography variant="h4">
              {formatCurrency(report.total_amount)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="textSecondary">
              Date Range
            </Typography>
            <Typography variant="h6">
              {formatDate(report.start_date)} - {formatDate(report.end_date)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="textSecondary">
              Total Orders
            </Typography>
            <Typography variant="h4">
              {Array.isArray(report.orders) ? report.orders.length : 0}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Service Totals
      </Typography>
      {renderServiceTotals()}

      <Box sx={{ mt: 4, mb: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          color="primary"
          onClick={() => onExport('excel')}
          startIcon={<FileDownloadIcon />}
          variant="contained"
          disabled={loading}
        >
          Export Excel
        </Button>
        <Button
          color="primary"
          onClick={() => onExport('pdf')}
          startIcon={<FileDownloadIcon />}
          variant="contained"
          disabled={loading}
        >
          Export PDF
        </Button>
      </Box>

      <Typography variant="h6" gutterBottom>
        Order Details
      </Typography>
      {Array.isArray(report.orders) && report.orders.length > 0 ? (
        <MaterialReactTable
          columns={columns}
          data={report.orders}
          enableColumnResizing
          enableColumnFilters
          enablePagination
          enableSorting
          muiTableContainerProps={{ sx: { maxHeight: '500px' } }}
          initialState={{
            density: 'compact',
            pagination: { pageSize: 10, pageIndex: 0 },
          }}
        />
      ) : (
        <Alert severity="info">No orders found for the selected period</Alert>
      )}
    </Box>
  );
};

export default ReportResults; 