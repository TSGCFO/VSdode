// src/features/services/components/ServiceList.jsx
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceApi } from '../../../services/api';
import ServiceForm from './ServiceForm';
import ServiceDetails from './ServiceDetails';
import ServiceFilter from './ServiceFilter';
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

const ServiceList = () => {
  const [sortField, setSortField] = useState('service_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    charge_type: '',
    created_after: '',
    created_before: '',
    updated_after: '',
    updated_before: '',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const queryClient = useQueryClient();

  // Combine search, sort, and filter parameters
  const queryParams = useMemo(() => ({
    page: pageIndex,
    search: searchTerm,
    ordering: `${sortOrder === 'desc' ? '-' : ''}${sortField}`,
    ...filters,
  }), [pageIndex, searchTerm, sortField, sortOrder, filters]);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['services', queryParams],
    queryFn: () => serviceApi.getServices(queryParams),
  });

  const deleteMutation = useMutation({
    mutationFn: serviceApi.deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      setIsDeleteModalOpen(false);
      setSelectedService(null);
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
    setSelectedService(null);
    setIsFormOpen(true);
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setIsFormOpen(true);
  };

  const handleDelete = (service) => {
    setSelectedService(service);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedService) {
      deleteMutation.mutate(selectedService.id);
    }
  };

  const handleExport = () => {
    // Convert the data to CSV format
    const headers = ['Service Name', 'Description', 'Charge Type', 'Created At', 'Updated At'];
    const csvData = data?.results?.map(service => [
      service.service_name,
      service.description,
      service.charge_type,
      new Date(service.created_at).toLocaleString(),
      new Date(service.updated_at).toLocaleString()
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'services.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-500">Loading services...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-red-500">Error loading services</div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between mb-4">
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search services..."
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
            Add service
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col relative">
        {isFetching && !isLoading && (
          <div className="absolute inset-0 bg-gray-200 bg-opacity-25 flex items-center justify-center">
            <div className="text-gray-500">Updating...</div>
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
                      onClick={() => handleSort('service_name')}
                    >
                      <div className="flex items-center">
                        Service Name
                        <SortIcon field="service_name" sortField={sortField} sortOrder={sortOrder} />
                      </div>
                    </th>
                    <th
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('description')}
                    >
                      <div className="flex items-center">
                        Description
                        <SortIcon field="description" sortField={sortField} sortOrder={sortOrder} />
                      </div>
                    </th>
                    <th
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('charge_type')}
                    >
                      <div className="flex items-center">
                        Charge Type
                        <SortIcon field="charge_type" sortField={sortField} sortOrder={sortOrder} />
                      </div>
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
                  {data?.results?.map((service) => (
                    <tr key={service.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        <button
                          onClick={() => setSelectedServiceForDetails(service.id)}
                          className="text-indigo-600 hover:underline text-left"
                        >
                          {service.service_name}
                        </button>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {service.description}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          service.charge_type === 'single'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {service.charge_type === 'single' ? 'Single Charge' : 'Quantity Based'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(service.created_at).toLocaleString()}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleEdit(service)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(service)}
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
        <ServiceForm
          service={selectedService}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedService(null);
          }}
        />
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-auto">
            <h3 className="text-lg font-medium text-gray-900">Delete Service</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete {selectedService?.service_name}? This action cannot be undone.
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

      {selectedServiceForDetails && (
        <ServiceDetails
          serviceId={selectedServiceForDetails}
          onClose={() => setSelectedServiceForDetails(null)}
        />
      )}

      {isFilterOpen && (
        <ServiceFilter
          filters={filters}
          onApply={handleFilterChange}
          onClose={() => setIsFilterOpen(false)}
        />
      )}
    </div>
  );
};

export default ServiceList;
