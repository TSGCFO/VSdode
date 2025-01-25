// src/features/customer-services/components/CustomerServiceFilter.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customerApi, serviceApi } from '../../../services/api';
import PropTypes from 'prop-types';

const CustomerServiceFilter = ({ filters, onApply, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  // Fetch customers for dropdown
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerApi.getCustomers({ ordering: 'company_name' }),
  });

  // Fetch services for dropdown
  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: () => serviceApi.getServices({ ordering: 'service_name' }),
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
    setLocalFilters(filters);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Filter Customer Services</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Service
              </label>
              <select
                name="service"
                value={localFilters.service}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All Services</option>
                {services?.results?.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.service_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Min Unit Price
              </label>
              <input
                type="number"
                name="unit_price_min"
                value={localFilters.unit_price_min}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Unit Price
              </label>
              <input
                type="number"
                name="unit_price_max"
                value={localFilters.unit_price_max}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700">
                SKU Status
              </label>
              <select
                name="has_skus"
                value={localFilters.has_skus}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All</option>
                <option value="true">Has SKUs</option>
                <option value="false">No SKUs</option>
              </select>
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

CustomerServiceFilter.propTypes = {
  filters: PropTypes.shape({
    customer: PropTypes.string,
    service: PropTypes.string,
    unit_price_min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    unit_price_max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    has_skus: PropTypes.string,
    created_after: PropTypes.string,
    created_before: PropTypes.string,
  }).isRequired,
  onApply: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CustomerServiceFilter;
