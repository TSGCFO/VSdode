// src/features/customer-services/components/CustomerServiceForm.jsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerServiceApi, customerApi, serviceApi } from '../../../services/api';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ message }) => (
  <div className="flex items-center justify-center h-full">
    <div className="text-gray-500 flex items-center">
      <svg 
        className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {message}
    </div>
  </div>
);

LoadingSpinner.propTypes = {
  message: PropTypes.string.isRequired,
};

const CustomerServiceForm = ({ customerService, onClose }) => {
  const queryClient = useQueryClient();
  const isEditing = Boolean(customerService);

  const [formData, setFormData] = useState({
    customer: customerService?.customer || '',
    service: customerService?.service || '',
    unit_price: customerService?.unit_price?.toString() || '',
    skus: customerService?.sku_list?.map(sku => sku.id) || [],
  });

  const [errors, setErrors] = useState({});

  // Fetch customers for dropdown
  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerApi.getCustomers({ ordering: 'company_name' }),
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  // Fetch services for dropdown
  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: () => serviceApi.getServices({ ordering: 'service_name' }),
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  // Fetch customer SKUs when customer is selected
  const { data: customerSkus, isLoading: isLoadingSkus } = useQuery({
    queryKey: ['customerSkus', formData.customer],
    queryFn: () => customerServiceApi.getCustomerSkus(formData.customer),
    enabled: Boolean(formData.customer),
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: customerServiceApi.createCustomerService,
    onSuccess: () => {
      queryClient.invalidateQueries(['customerServices']);
      onClose();
    },
    onError: (error) => {
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => customerServiceApi.updateCustomerService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['customerServices']);
      onClose();
    },
    onError: (error) => {
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    },
  });

  useEffect(() => {
    if (customerService) {
      setFormData({
        customer: customerService.customer,
        service: customerService.service,
        unit_price: customerService.unit_price?.toString() || '',
        skus: customerService.sku_list.map(sku => sku.id),
      });
    }
  }, [customerService]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (name === 'customer') {
      // Reset service and SKUs when customer changes
      setFormData(prev => ({
        ...prev,
        customer: value,
        service: '',
        skus: [],
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    // Clear related error when field changes
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSkuChange = (skuId) => {
    setFormData(prev => ({
      ...prev,
      skus: prev.skus.includes(skuId)
        ? prev.skus.filter(id => id !== skuId)
        : [...prev.skus, skuId],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      customer: formData.customer,
      service: formData.service,
      unit_price: formData.unit_price === '' ? null : Number(formData.unit_price),
      skus: formData.skus,
    };

    if (isEditing) {
      updateMutation.mutate({ id: customerService.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            {isEditing ? 'Edit Customer Service' : 'Add Customer Service'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Selection */}
          <div>
            <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
              Customer
            </label>
            {isLoadingCustomers ? (
              <LoadingSpinner message="Loading customers..." />
            ) : (
              <select
                id="customer"
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                disabled={isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select a customer</option>
                {customers?.results?.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.company_name}
                  </option>
                ))}
              </select>
            )}
            {errors.customer && (
              <p className="mt-1 text-sm text-red-600">{errors.customer}</p>
            )}
          </div>

          {/* Service Selection */}
          <div>
            <label htmlFor="service" className="block text-sm font-medium text-gray-700">
              Service
            </label>
            {isLoadingServices ? (
              <LoadingSpinner message="Loading services..." />
            ) : (
              <select
                id="service"
                name="service"
                value={formData.service}
                onChange={handleChange}
                disabled={isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select a service</option>
                {services?.results?.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.service_name}
                  </option>
                ))}
              </select>
            )}
            {errors.service && (
              <p className="mt-1 text-sm text-red-600">{errors.service}</p>
            )}
          </div>

          {/* Unit Price */}
          <div>
            <label htmlFor="unit_price" className="block text-sm font-medium text-gray-700">
              Unit Price
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="unit_price"
                id="unit_price"
                value={formData.unit_price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            {errors.unit_price && (
              <p className="mt-1 text-sm text-red-600">{errors.unit_price}</p>
            )}
          </div>

          {/* SKU Selection - Only shown when customer is selected */}
          {formData.customer && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Associated SKUs
              </label>
              <div className="bg-gray-50 p-4 rounded-md max-h-48 overflow-y-auto">
                {isLoadingSkus ? (
                  <LoadingSpinner message="Loading SKUs..." />
                ) : customerSkus?.length > 0 ? (
                  <div className="space-y-2">
                    {customerSkus.map((sku) => (
                      <label key={sku.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.skus.includes(sku.id)}
                          onChange={() => handleSkuChange(sku.id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-900">{sku.sku}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No SKUs available for this customer</p>
                )}
              </div>
              {errors.skus && (
                <p className="mt-1 text-sm text-red-600">{errors.skus}</p>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

CustomerServiceForm.propTypes = {
  customerService: PropTypes.shape({
    id: PropTypes.number.isRequired,
    customer: PropTypes.number.isRequired,
    customer_name: PropTypes.string,
    service: PropTypes.number.isRequired,
    service_name: PropTypes.string,
    unit_price: PropTypes.number,
    sku_list: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        sku: PropTypes.string.isRequired,
      })
    ).isRequired,
  }),
  onClose: PropTypes.func.isRequired,
};

export default CustomerServiceForm;
