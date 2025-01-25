// src/features/customers/components/CustomerList.jsx
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '../../../services/api';
import CustomerForm from './CustomerForm';
import CustomerDetails from "./CustomerDetails.jsx";
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

const CustomerList = () => {
  const [sortField, setSortField] = useState('company_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerForDetails, setSelectedCustomerForDetails] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const [pageIndex, setPageIndex] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['customers', pageIndex, searchTerm, sortField, sortOrder],
    queryFn: () => customerApi.getCustomers({
      page: pageIndex,
      search: searchTerm,
      ordering: `${sortOrder === 'desc' ? '-' : ''}${sortField}`
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: customerApi.deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
      setIsDeleteModalOpen(false);
      setSelectedCustomer(null);
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
      setPageIndex(1); // Reset to first page when searching
    }, 300),
    []
  );

  const handleAddNew = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDelete = (customer) => {
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCustomer) {
      deleteMutation.mutate(selectedCustomer.id);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCustomer(null);
  };

  const handleCloseDetails = () => {
    setSelectedCustomerForDetails(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-500">Loading customers...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-red-500">Error loading customers</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Customers</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all customers including their name, email, and location.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Add customer
          </button>
        </div>
      </div>

      <div className="mt-4">
        <input
          type="text"
          placeholder="Search customers..."
          onChange={(e) => debouncedSearch(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mt-8 flex flex-col relative">
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
                      onClick={() => handleSort('company_name')}
                    >
                      <div className="flex items-center">
                        Company Name
                        <SortIcon field="company_name" sortField={sortField} sortOrder={sortOrder} />
                      </div>
                    </th>
                    <th
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center">
                        Email
                        <SortIcon field="email" sortField={sortField} sortOrder={sortOrder} />
                      </div>
                    </th>
                    <th
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('phone')}
                    >
                      <div className="flex items-center">
                        Phone
                        <SortIcon field="phone" sortField={sortField} sortOrder={sortOrder} />
                      </div>
                    </th>
                    <th
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('city')}
                    >
                      <div className="flex items-center">
                        Location
                        <SortIcon field="city" sortField={sortField} sortOrder={sortOrder} />
                      </div>
                    </th>
                    <th
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('is_active')}
                    >
                      <div className="flex items-center">
                        Status
                        <SortIcon field="is_active" sortField={sortField} sortOrder={sortOrder} />
                      </div>
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {data?.results?.map((customer) => (
                    <tr key={customer.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        <button
                          onClick={() => setSelectedCustomerForDetails(customer.id)}
                          className="text-indigo-600 hover:underline text-left"
                        >
                          {customer.company_name}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {customer.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {customer.phone}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {[customer.city, customer.state, customer.country]
                          .filter(Boolean)
                          .join(', ')}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            customer.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {customer.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDelete(customer)}
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

      {isFormOpen && (
        <CustomerForm
          customer={selectedCustomer}
          onClose={handleCloseForm}
        />
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-auto">
            <h3 className="text-lg font-medium text-gray-900">Delete Customer</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete {selectedCustomer?.company_name}? This action cannot be undone.
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

      {selectedCustomerForDetails && (
        <CustomerDetails
          customerId={selectedCustomerForDetails}
          onClose={handleCloseDetails}
        />
      )}

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
    </div>
  );
};

export default CustomerList;
