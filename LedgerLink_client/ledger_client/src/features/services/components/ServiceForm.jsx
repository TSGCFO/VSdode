// src/features/services/components/ServiceForm.jsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { serviceApi } from '../../../services/api';

const ServiceForm = ({ service, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    service_name: service?.service_name || '',
    description: service?.description || '',
    charge_type: service?.charge_type || 'quantity',
  });
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: service
      ? (data) => serviceApi.updateService(service.id, data)
      : serviceApi.createService,
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      onClose();
    },
    onError: (error) => {
      const serverErrors = error.response?.data || {};
      setErrors(serverErrors);
    },
  });

  const validateForm = () => {
    const newErrors = {};
    if (!formData.service_name.trim()) {
      newErrors.service_name = 'Service name is required';
    }
    if (!formData.charge_type) {
      newErrors.charge_type = 'Charge type is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      mutation.mutate(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            {service ? 'Edit Service' : 'Add New Service'}
          </h2>
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
              Service Name
            </label>
            <input
              type="text"
              name="service_name"
              value={formData.service_name}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.service_name
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
            {errors.service_name && (
              <p className="mt-1 text-sm text-red-600">{errors.service_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Charge Type
            </label>
            <select
              name="charge_type"
              value={formData.charge_type}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.charge_type
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            >
              <option value="single">Single Charge</option>
              <option value="quantity">Quantity Based</option>
            </select>
            {errors.charge_type && (
              <p className="mt-1 text-sm text-red-600">{errors.charge_type}</p>
            )}
          </div>

          {/* Display any non-field errors */}
          {errors.non_field_errors && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {errors.non_field_errors}
            </div>
          )}

          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
              type="submit"
              disabled={mutation.isLoading}
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isLoading
                ? 'Saving...'
                : service
                ? 'Update Service'
                : 'Create Service'}
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

ServiceForm.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.number,
    service_name: PropTypes.string,
    description: PropTypes.string,
    charge_type: PropTypes.oneOf(['single', 'quantity']),
  }),
  onClose: PropTypes.func.isRequired,
};

export default ServiceForm;
