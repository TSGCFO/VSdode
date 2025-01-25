// src/features/orders/components/OrderList.jsx
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../../../services/api';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import OrderForm from './OrderForm';
import OrderDetails from './OrderDetails';
import OrderFilter from './OrderFilter';
import ColumnSelector from '../../../components/shared/ColumnSelector';
import { FaSort, FaSortUp, FaSortDown, FaCog } from 'react-icons/fa';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';

// Define all available columns
const ALL_COLUMNS = {
  transaction_id: { label: 'Transaction ID', sortKey: 'transaction_id' },
  customer: { label: 'Customer', sortKey: 'customer__company_name' },
  reference_number: { label: 'Reference', sortKey: 'reference_number' },
  status: { label: 'Status', sortKey: 'status' },
  priority: { label: 'Priority', sortKey: 'priority' },
  ship_to_name: { label: 'Ship To Name', sortKey: 'ship_to_name' },
  ship_to_company: { label: 'Ship To Company', sortKey: 'ship_to_company' },
  ship_to_address: { label: 'Address', sortKey: 'ship_to_address' },
  ship_to_address2: { label: 'Address 2', sortKey: 'ship_to_address2' },
  ship_to_city: { label: 'City', sortKey: 'ship_to_city' },
  ship_to_state: { label: 'State', sortKey: 'ship_to_state' },
  ship_to_zip: { label: 'ZIP', sortKey: 'ship_to_zip' },
  ship_to_country: { label: 'Country', sortKey: 'ship_to_country' },
  weight_lb: { label: 'Weight (lb)', sortKey: 'weight_lb' },
  line_items: { label: 'Line Items', sortKey: 'line_items' },
  total_item_qty: { label: 'Total Items', sortKey: 'total_item_qty' },
  volume_cuft: { label: 'Volume (cuft)', sortKey: 'volume_cuft' },
  packages: { label: 'Packages', sortKey: 'packages' },
  carrier: { label: 'Carrier', sortKey: 'carrier' },
  close_date: { label: 'Close Date', sortKey: 'close_date' },
  notes: { label: 'Notes', sortKey: 'notes' },
};

// Define column groups
const COLUMN_GROUPS = {
  basic: {
    label: 'Basic Information',
    columns: ['transaction_id', 'customer', 'reference_number', 'status', 'priority'],
  },
  shipping: {
    label: 'Shipping Information',
    columns: [
      'ship_to_name',
      'ship_to_company',
      'ship_to_address',
      'ship_to_address2',
      'ship_to_city',
      'ship_to_state',
      'ship_to_zip',
      'ship_to_country',
      'carrier',
    ],
  },
  package: {
    label: 'Package Details',
    columns: ['weight_lb', 'volume_cuft', 'packages', 'line_items', 'total_item_qty'],
  },
  other: {
    label: 'Other',
    columns: ['close_date', 'notes'],
  },
};

// Default visible columns
const DEFAULT_VISIBLE_COLUMNS = [
  'transaction_id',
  'customer',
  'reference_number',
  'status',
  'priority',
  'ship_to_name',
  'total_item_qty',
  'close_date',
];

const SortIcon = ({ field, sortField, sortOrder }) => {
  if (sortField !== field) {
    return <FaSort className="ml-1 inline-block" />;
  }
  return sortOrder === 'asc' ? (
    <FaSortUp className="ml-1 inline-block" />
  ) : (
    <FaSortDown className="ml-1 inline-block" />
  );
};

SortIcon.propTypes = {
  field: PropTypes.string.isRequired,
  sortField: PropTypes.string.isRequired,
  sortOrder: PropTypes.string.isRequired,
};

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const colors = {
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    shipped: 'bg-yellow-100 text-yellow-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const color = colors[status] || colors.draft;

  return (
    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${color}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.oneOf(['draft', 'submitted', 'shipped', 'delivered', 'cancelled']),
};

const PriorityBadge = ({ priority }) => {
  if (!priority) return null;

  const colors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const color = colors[priority] || colors.medium;

  return (
    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${color}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

PriorityBadge.propTypes = {
  priority: PropTypes.oneOf(['low', 'medium', 'high']),
};

const OrderList = () => {
  const [sortField, setSortField] = useState('transaction_id');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    customer: '',
    status: '',
    priority: '',
    created_after: '',
    created_before: '',
    closed_after: '',
    closed_before: '',
    min_weight: '',
    max_weight: '',
    min_volume: '',
    max_volume: '',
    carrier: '',
    city: '',
    state: '',
    country: '',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useLocalStorage('orderListColumns', DEFAULT_VISIBLE_COLUMNS);
  const queryClient = useQueryClient();

  // Combine search, sort, and filter parameters
  const queryParams = useMemo(() => ({
    page: pageIndex,
    search: searchTerm,
    ordering: `${sortOrder === 'desc' ? '-' : ''}${sortField}`,
    ...filters,
  }), [pageIndex, searchTerm, sortField, sortOrder, filters]);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['orders', queryParams],
    queryFn: () => orderApi.getOrders(queryParams),
  });

  const deleteMutation = useMutation({
    mutationFn: orderApi.deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      setIsDeleteModalOpen(false);
      setSelectedOrder(null);
    },
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setPageIndex(1);
    }, 300),
    []
  );

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPageIndex(1);
  };

  const handleAddNew = () => {
    setSelectedOrder(null);
    setIsFormOpen(true);
  };

  const handleEdit = (order) => {
    // Convert numeric fields to numbers
    const processedOrder = {
      ...order,
      weight_lb: order.weight_lb ? Number(order.weight_lb) : '',
      volume_cuft: order.volume_cuft ? Number(order.volume_cuft) : '',
      packages: order.packages ? Number(order.packages) : '',
      total_item_qty: order.total_item_qty ? Number(order.total_item_qty) : '',
      line_items: order.line_items ? Number(order.line_items) : '',
      // Convert SKU quantities to numbers
      sku_quantity: order.sku_quantity ? Object.fromEntries(
        Object.entries(order.sku_quantity).map(([sku, qty]) => [
          sku,
          typeof qty === 'object' ? Number(qty.quantity) : Number(qty)
        ])
      ) : {},
    };
    setSelectedOrder(processedOrder);
    setIsFormOpen(true);
  };

  const handleDelete = (order) => {
    setSelectedOrder(order);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedOrder) {
      deleteMutation.mutate(selectedOrder.transaction_id);
    }
  };

  const handleExport = () => {
    const headers = visibleColumns.map(key => ALL_COLUMNS[key].label);
    const csvData = data?.results?.map(order => 
      visibleColumns.map(key => {
        if (key === 'customer') return order.customer_details?.company_name || '';
        if (key === 'close_date') return order.close_date ? new Date(order.close_date).toLocaleString() : 'N/A';
        return order[key] || '';
      })
    );

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-500">Loading orders...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-red-500">Error loading orders</div>
      </div>
    );
  }

  const renderCellContent = (order, columnKey) => {
    switch (columnKey) {
      case 'transaction_id':
        return (
          <button
            onClick={() => setSelectedOrderForDetails(order.transaction_id)}
            className="text-indigo-600 hover:underline text-left"
          >
            {order.transaction_id}
          </button>
        );
      case 'customer':
        return order.customer_details?.company_name;
      case 'status':
        return <StatusBadge status={order.status} />;
      case 'priority':
        return <PriorityBadge priority={order.priority} />;
      case 'close_date':
        return order.close_date ? new Date(order.close_date).toLocaleDateString() : 'N/A';
      case 'ship_to_name':
        return (
          <div className="flex flex-col">
            <span>{order.ship_to_name}</span>
            <span className="text-xs text-gray-400">
              {[order.ship_to_city, order.ship_to_state, order.ship_to_country]
                .filter(Boolean)
                .join(', ')}
            </span>
          </div>
        );
      default:
        return order[columnKey];
    }
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between mb-4">
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search orders..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <button
            onClick={() => setIsFilterOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Filters
          </button>
          <div className="relative">
            <button
              onClick={() => setIsColumnSelectorOpen(!isColumnSelectorOpen)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaCog className="mr-2" />
              Columns
            </button>
            {isColumnSelectorOpen && (
              <ColumnSelector
                columns={ALL_COLUMNS}
                selectedColumns={visibleColumns}
                onChange={setVisibleColumns}
                onClose={() => setIsColumnSelectorOpen(false)}
                columnGroups={COLUMN_GROUPS}
              />
            )}
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Export
          </button>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Add order
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col relative">
        {isFetching && !isLoading && (
          <div className="absolute inset-0 bg-gray-200 bg-opacity-25 flex items-center justify-center">
            <div className="text-gray-500">Updating...</div>
          </div>
        )}

        <div className="-my-2 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        {visibleColumns.map(columnKey => (
                          <th
                            key={columnKey}
                            className="sticky top-0 z-10 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 bg-gray-50 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort(ALL_COLUMNS[columnKey].sortKey)}
                          >
                            <div className="flex items-center">
                              {ALL_COLUMNS[columnKey].label}
                              <SortIcon
                                field={ALL_COLUMNS[columnKey].sortKey}
                                sortField={sortField}
                                sortOrder={sortOrder}
                              />
                            </div>
                          </th>
                        ))}
                        <th className="sticky top-0 z-10 relative py-3.5 pl-3 pr-4 sm:pr-6 bg-gray-50">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {data?.results?.map((order) => (
                        <tr key={order.transaction_id}>
                          {visibleColumns.map(columnKey => (
                            <td key={columnKey} className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {renderCellContent(order, columnKey)}
                            </td>
                          ))}
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => handleEdit(order)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(order)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex justify-between sm:hidden">
          <button
            onClick={() => setPageIndex(prev => Math.max(prev - 1, 1))}
            disabled={pageIndex === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPageIndex(prev => prev + 1)}
            disabled={!data?.next}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">
                {data?.count ? (pageIndex - 1) * 10 + 1 : 0}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(pageIndex * 10, data?.count || 0)}
              </span>{' '}
              of{' '}
              <span className="font-medium">{data?.count || 0}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => setPageIndex(prev => Math.max(prev - 1, 1))}
                disabled={pageIndex === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                Previous
              </button>
              <button
                onClick={() => setPageIndex(prev => prev + 1)}
                disabled={!data?.next}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <OrderForm
          key="order-form"
          order={selectedOrder}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-auto">
            <h3 className="text-lg font-medium text-gray-900">Delete Order</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete this order? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedOrderForDetails && (
        <OrderDetails
          orderId={selectedOrderForDetails}
          onClose={() => setSelectedOrderForDetails(null)}
        />
      )}

      {isFilterOpen && (
        <OrderFilter
          filters={filters}
          onApply={handleFilterChange}
          onClose={() => setIsFilterOpen(false)}
        />
      )}
    </div>
  );
};

export default OrderList;
