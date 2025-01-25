// src/features/customer-services/components/CustomerServiceList.jsx
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { customerServiceApi } from '../../../services/api';
import CustomerServiceForm from './CustomerServiceForm';
import CustomerServiceDetails from './CustomerServiceDetails';
import CustomerServiceFilter from './CustomerServiceFilter';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';

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

const LoadingSpinner = ({ message }) => (
  <div className="flex items-center justify-center h-full">
    <div className="text-gray-500 flex items-center">
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {message}
    </div>
  </div>
);

LoadingSpinner.propTypes = {
  message: PropTypes.string.isRequired,
};

const CustomerServiceList = () => {
  const [sortField, setSortField] = useState('customer__company_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomerService, setSelectedCustomerService] = useState(null);
  const [selectedCustomerServiceForDetails, setSelectedCustomerServiceForDetails] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    customer: '',
    service: '',
    unit_price_min: '',
    unit_price_max: '',
    has_skus: '',
    created_after: '',
    created_before: '',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const queryClient = useQueryClient();

  // Create stable query key
  const queryKey = useMemo(() => ({
    type: 'customerServices',
    params: {
      page: pageIndex,
      search: searchTerm,
      ordering: `${sortOrder === 'desc' ? '-' : ''}${sortField}`,
      ...filters,
    }
  }), [pageIndex, searchTerm, sortField, sortOrder, filters]);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: [queryKey.type, queryKey.params],
    queryFn: () => customerServiceApi.getCustomerServices(queryKey.params),
    refetchOnWindowFocus: false,
    staleTime: 30000,
    cacheTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });

  const deleteMutation = useMutation({
    mutationFn: customerServiceApi.deleteCustomerService,
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey.type]);
      setIsDeleteModalOpen(false);
      setSelectedCustomerService(null);
    },
  });

  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }, [sortField, sortOrder]);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setPageIndex(1);
    }, 300),
    []
  );

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPageIndex(1);
  }, []);

  const handleAddNew = useCallback(() => {
    setSelectedCustomerService(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((customerService) => {
    setSelectedCustomerService({
      ...customerService,
      unit_price: Number(customerService.unit_price),
    });
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback((customerService) => {
    setSelectedCustomerService(customerService);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (selectedCustomerService) {
      deleteMutation.mutate(selectedCustomerService.id);
    }
  }, [selectedCustomerService, deleteMutation]);

  const handleExport = useCallback(() => {
    const headers = [
      'Customer',
      'Service',
      'Unit Price',
      'SKUs',
      'Created At',
      'Updated At'
    ];
    const csvData = data?.results?.map(cs => [
      cs.customer_name,
      cs.service_name,
      cs.unit_price,
      cs.sku_list.map(sku => sku.sku).join('; '),
      new Date(cs.created_at).toLocaleString(),
      new Date(cs.updated_at).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer-services.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [data?.results]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <LoadingSpinner message="Loading customer services..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-red-500">Error loading customer services</div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between mb-4">
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search customer services..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <button
            onClick={() => setIsFilterOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Filters
          </button>
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
            Add customer service
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col relative">
        {isFetching && !isLoading && (
          <div className="absolute inset-0 bg-gray-200 bg-opacity-25">
            <LoadingSpinner message="Updating..." />
          </div>
        )}

        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('customer__company_name')}
                    >
                      <div className="flex items-center">
                        Customer
                        <SortIcon field="customer__company_name" sortField={sortField} sortOrder={sortOrder} />
                      </div>
                    </th>
                    <th
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('service__service_name')}
                    >
                      <div className="flex items-center">
                        Service
                        <SortIcon field="service__service_name" sortField={sortField} sortOrder={sortOrder} />
                      </div>
                    </th>
                    <th
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('unit_price')}
                    >
                      <div className="flex items-center">
                        Unit Price
                        <SortIcon field="unit_price" sortField={sortField} sortOrder={sortOrder} />
                      </div>
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      SKUs
                    </th>
                    <th
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center">
                        Created At
                        <SortIcon field="created_at" sortField={sortField} sortOrder={sortOrder} />
                      </div>
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {data?.results?.map((customerService) => (
                    <tr key={customerService.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        <Link
                          to={`/customers/${customerService.customer}`}
                          className="text-indigo-600 hover:text-indigo-900 hover:underline"
                        >
                          {customerService.customer_name}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <Link
                          to={`/services/${customerService.service}`}
                          className="text-indigo-600 hover:text-indigo-900 hover:underline"
                        >
                          {customerService.service_name}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        ${customerService.unit_price}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {customerService.sku_list.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {customerService.sku_list.map((sku) => (
                              <span
                                key={sku.id}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {sku.sku}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">No SKUs assigned</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(customerService.created_at).toLocaleString()}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleEdit(customerService)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(customerService)}
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
        <CustomerServiceForm
          customerService={selectedCustomerService}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedCustomerService(null);
          }}
        />
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-auto">
            <h3 className="text-lg font-medium text-gray-900">Delete Customer Service</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete this customer service? This action cannot be undone.
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

      {selectedCustomerServiceForDetails && (
        <CustomerServiceDetails
          customerServiceId={selectedCustomerServiceForDetails}
          onClose={() => setSelectedCustomerServiceForDetails(null)}
        />
      )}

      {isFilterOpen && (
        <CustomerServiceFilter
          filters={filters}
          onApply={handleFilterChange}
          onClose={() => setIsFilterOpen(false)}
        />
      )}
    </div>
  );
};

export default CustomerServiceList;
