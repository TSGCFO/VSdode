// src/features/products/components/ProductForm.jsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi, customerApi } from '../../../services/api';
import PropTypes from 'prop-types';

const ProductForm = ({ product, onClose }) => {
  const queryClient = useQueryClient();
  const isEditing = Boolean(product);

  const [formData, setFormData] = useState({
    sku: '',
    customer: '',
    labeling_unit_1: '',
    labeling_quantity_1: '',
    labeling_unit_2: '',
    labeling_quantity_2: '',
    labeling_unit_3: '',
    labeling_quantity_3: '',
    labeling_unit_4: '',
    labeling_quantity_4: '',
    labeling_unit_5: '',
    labeling_quantity_5: '',
  });

  const [errors, setErrors] = useState({});

  // Fetch customers for dropdown
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerApi.getCustomers({ ordering: 'company_name' }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: productApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
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
    mutationFn: ({ id, data }) => productApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      onClose();
    },
    onError: (error) => {
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    },
  });

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        customer: product.customer || '',
        labeling_unit_1: product.labeling_unit_1 || '',
        labeling_quantity_1: product.labeling_quantity_1 || '',
        labeling_unit_2: product.labeling_unit_2 || '',
        labeling_quantity_2: product.labeling_quantity_2 || '',
        labeling_unit_3: product.labeling_unit_3 || '',
        labeling_quantity_3: product.labeling_quantity_3 || '',
        labeling_unit_4: product.labeling_unit_4 || '',
        labeling_quantity_4: product.labeling_quantity_4 || '',
        labeling_unit_5: product.labeling_unit_5 || '',
        labeling_quantity_5: product.labeling_quantity_5 || '',
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
    // Clear related error when field changes
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }
    if (!formData.customer) {
      newErrors.customer = 'Customer is required';
    }
    
    // Validate quantities are non-negative if provided
    for (let i = 1; i <= 5; i++) {
      const quantity = formData[`labeling_quantity_${i}`];
      const unit = formData[`labeling_unit_${i}`];
      
      if (quantity && quantity < 0) {
        newErrors[`labeling_quantity_${i}`] = 'Quantity must be non-negative';
      }
      
      // If quantity is provided, unit is required and vice versa
      if ((quantity && !unit) || (!quantity && unit)) {
        newErrors[`labeling_unit_${i}`] = 'Both unit and quantity must be provided together';
        newErrors[`labeling_quantity_${i}`] = 'Both unit and quantity must be provided together';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const data = {
        ...formData,
        customer: formData.customer || null,
        // Convert empty strings to null for optional fields
        labeling_unit_1: formData.labeling_unit_1 || null,
        labeling_unit_2: formData.labeling_unit_2 || null,
        labeling_unit_3: formData.labeling_unit_3 || null,
        labeling_unit_4: formData.labeling_unit_4 || null,
        labeling_unit_5: formData.labeling_unit_5 || null,
        labeling_quantity_1: formData.labeling_quantity_1 || null,
        labeling_quantity_2: formData.labeling_quantity_2 || null,
        labeling_quantity_3: formData.labeling_quantity_3 || null,
        labeling_quantity_4: formData.labeling_quantity_4 || null,
        labeling_quantity_5: formData.labeling_quantity_5 || null,
      };

      if (isEditing) {
        updateMutation.mutate({ id: product.id, data });
      } else {
        createMutation.mutate(data);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            {isEditing ? 'Edit Product' : 'Add New Product'}
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
              SKU
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              disabled={isEditing}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.sku
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
            {errors.sku && (
              <p className="mt-1 text-sm text-red-600">{errors.sku}</p>
            )}
          </div>

          {/* Labeling Fields */}
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="border-t pt-4 mt-4 first:border-t-0 first:pt-0 first:mt-0">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Labeling Set {index}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Unit {index}
                  </label>
                  <input
                    type="text"
                    name={`labeling_unit_${index}`}
                    value={formData[`labeling_unit_${index}`]}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                      errors[`labeling_unit_${index}`]
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
                  />
                  {errors[`labeling_unit_${index}`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`labeling_unit_${index}`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity {index}
                  </label>
                  <input
                    type="number"
                    name={`labeling_quantity_${index}`}
                    value={formData[`labeling_quantity_${index}`]}
                    onChange={handleChange}
                    min="0"
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                      errors[`labeling_quantity_${index}`]
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
                  />
                  {errors[`labeling_quantity_${index}`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`labeling_quantity_${index}`]}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

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
              <option value="">No Customer</option>
              {customers?.results?.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.company_name}
                </option>
              ))}
            </select>
            {errors.customer && (
              <p className="mt-1 text-sm text-red-600">{errors.customer}</p>
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
              disabled={createMutation.isLoading || updateMutation.isLoading}
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isLoading || updateMutation.isLoading
                ? 'Saving...'
                : isEditing
                ? 'Update Product'
                : 'Create Product'}
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

ProductForm.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    sku: PropTypes.string.isRequired,
    customer: PropTypes.number,
    labeling_unit_1: PropTypes.string,
    labeling_quantity_1: PropTypes.number,
    labeling_unit_2: PropTypes.string,
    labeling_quantity_2: PropTypes.number,
    labeling_unit_3: PropTypes.string,
    labeling_quantity_3: PropTypes.number,
    labeling_unit_4: PropTypes.string,
    labeling_quantity_4: PropTypes.number,
    labeling_unit_5: PropTypes.string,
    labeling_quantity_5: PropTypes.number,
  }),
  onClose: PropTypes.func.isRequired,
};

export default ProductForm;
