// src/features/products/components/ProductFilter.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customerApi } from '../../../services/api';
import PropTypes from 'prop-types';

const ProductFilter = ({ filters, onApply, onClose }) => {
  const [formData, setFormData] = useState({
    customer: filters.customer || '',
    created_after: filters.created_after || '',
    created_before: filters.created_before || '',
    updated_after: filters.updated_after || '',
    updated_before: filters.updated_before || '',
    labeling_unit: filters.labeling_unit || '',
    min_quantity: filters.min_quantity || '',
    max_quantity: filters.max_quantity || '',
    unit_number: filters.unit_number || '',
  });

  // Fetch customers for dropdown
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerApi.getCustomers({ ordering: 'company_name' }),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply(formData);
    onClose();
  };

  const handleReset = () => {
    setFormData({
      customer: '',
      created_after: '',
      created_before: '',
      updated_after: '',
      updated_before: '',
      labeling_unit: '',
      min_quantity: '',
      max_quantity: '',
      unit_number: '',
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Filter Products</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Customer
            </label>
            <select
              name="customer"
              value={formData.customer}
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Unit Number
              </label>
              <select
                name="unit_number"
                value={formData.unit_number}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All Units</option>
                <option value="1">Unit 1</option>
                <option value="2">Unit 2</option>
                <option value="3">Unit 3</option>
                <option value="4">Unit 4</option>
                <option value="5">Unit 5</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Labeling Unit Contains
              </label>
              <input
                type="text"
                name="labeling_unit"
                value={formData.labeling_unit}
                onChange={handleChange}
                placeholder="Search labeling units..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-3 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Min Quantity
                </label>
                <input
                  type="number"
                  name="min_quantity"
                  value={formData.min_quantity}
                  onChange={handleChange}
                  min="0"
                  placeholder="Minimum quantity"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Max Quantity
                </label>
                <input
                  type="number"
                  name="max_quantity"
                  value={formData.max_quantity}
                  onChange={handleChange}
                  min="0"
                  placeholder="Maximum quantity"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Created After
              </label>
              <input
                type="datetime-local"
                name="created_after"
                value={formData.created_after}
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
                value={formData.created_before}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Updated After
              </label>
              <input
                type="datetime-local"
                name="updated_after"
                value={formData.updated_after}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Updated Before
              </label>
              <input
                type="datetime-local"
                name="updated_before"
                value={formData.updated_before}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-3 sm:gap-3">
            <button
              type="submit"
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-3 sm:text-sm"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:mt-0 sm:text-sm"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ProductFilter.propTypes = {
  filters: PropTypes.shape({
    customer: PropTypes.string,
    created_after: PropTypes.string,
    created_before: PropTypes.string,
    updated_after: PropTypes.string,
    updated_before: PropTypes.string,
    labeling_unit: PropTypes.string,
    min_quantity: PropTypes.string,
    max_quantity: PropTypes.string,
    unit_number: PropTypes.string,
  }).isRequired,
  onApply: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ProductFilter;
