// src/features/orders/components/OrderFilter.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customerApi } from '../../../services/api';
import PropTypes from 'prop-types';

const OrderFilter = ({ filters, onApply, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  // Fetch customers for dropdown
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerApi.getCustomers({ ordering: 'company_name' }),
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setLocalFilters(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleApply = () => {
    // Remove empty filters
    const cleanedFilters = Object.entries(localFilters).reduce((acc, [key, value]) => {
      if (value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    onApply(cleanedFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({
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
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Filter Orders</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Customer
              </label>
              <select
                name="customer"
                value={localFilters.customer}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All Customers</option>
                {customers?.results?.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.company_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                value={localFilters.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Priority Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                name="priority"
                value={localFilters.priority}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Created Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Created After
              </label>
              <input
                type="datetime-local"
                name="created_after"
                value={localFilters.created_after}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Created Before
              </label>
              <input
                type="datetime-local"
                name="created_before"
                value={localFilters.created_before}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {/* Close Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Closed After
              </label>
              <input
                type="datetime-local"
                name="closed_after"
                value={localFilters.closed_after}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Closed Before
              </label>
              <input
                type="datetime-local"
                name="closed_before"
                value={localFilters.closed_before}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {/* Weight Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Min Weight (lb)
              </label>
              <input
                type="number"
                name="min_weight"
                value={localFilters.min_weight}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Weight (lb)
              </label>
              <input
                type="number"
                name="max_weight"
                value={localFilters.max_weight}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {/* Volume Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Min Volume (cuft)
              </label>
              <input
                type="number"
                name="min_volume"
                value={localFilters.min_volume}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Volume (cuft)
              </label>
              <input
                type="number"
                name="max_volume"
                value={localFilters.max_volume}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {/* Shipping Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Carrier
              </label>
              <input
                type="text"
                name="carrier"
                value={localFilters.carrier}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                name="city"
                value={localFilters.city}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                name="state"
                value={localFilters.state}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={localFilters.country}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

OrderFilter.propTypes = {
  filters: PropTypes.shape({
    customer: PropTypes.string,
    status: PropTypes.string,
    priority: PropTypes.string,
    created_after: PropTypes.string,
    created_before: PropTypes.string,
    closed_after: PropTypes.string,
    closed_before: PropTypes.string,
    min_weight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    max_weight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    min_volume: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    max_volume: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    carrier: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    country: PropTypes.string,
  }).isRequired,
  onApply: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default OrderFilter;
