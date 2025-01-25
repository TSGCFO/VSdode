// src/features/orders/components/OrderForm.jsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi, customerApi } from '../../../services/api';
import PropTypes from 'prop-types';

const OrderForm = ({ order, onClose }) => {
  const queryClient = useQueryClient();
  const isEditing = Boolean(order);

  const [formData, setFormData] = useState({
    customer: '',
    reference_number: '',
    status: 'draft',
    priority: 'medium',
    ship_to_name: '',
    ship_to_company: '',
    ship_to_address: '',
    ship_to_address2: '',
    ship_to_city: '',
    ship_to_state: '',
    ship_to_zip: '',
    ship_to_country: '',
    weight_lb: '',
    volume_cuft: '',
    packages: '',
    carrier: '',
    notes: '',
    sku_quantity: {},
  });

  const [errors, setErrors] = useState({});
  const [skuInput, setSkuInput] = useState({ sku: '', quantity: '' });

  // Fetch customers for dropdown
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerApi.getCustomers({ ordering: 'company_name' }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: orderApi.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
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
    mutationFn: ({ id, data }) => orderApi.updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      onClose();
    },
    onError: (error) => {
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    },
  });

  useEffect(() => {
    if (order) {
      setFormData({
        customer: order.customer,
        reference_number: order.reference_number || '',
        status: order.status || 'draft',
        priority: order.priority || 'medium',
        ship_to_name: order.ship_to_name || '',
        ship_to_company: order.ship_to_company || '',
        ship_to_address: order.ship_to_address || '',
        ship_to_address2: order.ship_to_address2 || '',
        ship_to_city: order.ship_to_city || '',
        ship_to_state: order.ship_to_state || '',
        ship_to_zip: order.ship_to_zip || '',
        ship_to_country: order.ship_to_country || '',
        weight_lb: order.weight_lb ? Number(order.weight_lb) : '',
        volume_cuft: order.volume_cuft ? Number(order.volume_cuft) : '',
        packages: order.packages ? Number(order.packages) : '',
        carrier: order.carrier || '',
        notes: order.notes || '',
        sku_quantity: order.sku_quantity ? Object.fromEntries(
          Object.entries(order.sku_quantity).map(([sku, qty]) => [sku, Number(qty)])
        ) : {},
      });
    }
  }, [order]);

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

  const handleSkuAdd = () => {
    if (skuInput.sku && skuInput.quantity) {
      setFormData(prev => ({
        ...prev,
        sku_quantity: {
          ...prev.sku_quantity,
          [skuInput.sku]: Number(skuInput.quantity),
        },
      }));
      setSkuInput({ sku: '', quantity: '' });
    }
  };

  const handleSkuRemove = (sku) => {
    setFormData(prev => {
      const newSkuQuantity = { ...prev.sku_quantity };
      delete newSkuQuantity[sku];
      return {
        ...prev,
        sku_quantity: newSkuQuantity,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Calculate total_item_qty from sku_quantity
    const data = {
      ...formData,
      total_item_qty: Object.values(formData.sku_quantity).reduce((a, b) => a + b, 0),
      line_items: Object.keys(formData.sku_quantity).length,
    };

    if (isEditing) {
      updateMutation.mutate({ id: order.transaction_id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 overflow-y-auto z-[9999]">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Edit Order' : 'Create Order'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
                      Customer
                    </label>
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
                    {errors.customer && (
                      <p className="mt-1 text-sm text-red-600">{errors.customer}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="reference_number" className="block text-sm font-medium text-gray-700">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      name="reference_number"
                      id="reference_number"
                      value={formData.reference_number}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.reference_number && (
                      <p className="mt-1 text-sm text-red-600">{errors.reference_number}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="draft">Draft</option>
                      <option value="submitted">Submitted</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    {errors.status && (
                      <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    {errors.priority && (
                      <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ship_to_name" className="block text-sm font-medium text-gray-700">
                      Ship To Name
                    </label>
                    <input
                      type="text"
                      name="ship_to_name"
                      id="ship_to_name"
                      value={formData.ship_to_name}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="ship_to_company" className="block text-sm font-medium text-gray-700">
                      Ship To Company
                    </label>
                    <input
                      type="text"
                      name="ship_to_company"
                      id="ship_to_company"
                      value={formData.ship_to_company}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="ship_to_address" className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <input
                      type="text"
                      name="ship_to_address"
                      id="ship_to_address"
                      value={formData.ship_to_address}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="ship_to_address2" className="block text-sm font-medium text-gray-700">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      name="ship_to_address2"
                      id="ship_to_address2"
                      value={formData.ship_to_address2}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="ship_to_city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      name="ship_to_city"
                      id="ship_to_city"
                      value={formData.ship_to_city}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="ship_to_state" className="block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <input
                      type="text"
                      name="ship_to_state"
                      id="ship_to_state"
                      value={formData.ship_to_state}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="ship_to_zip" className="block text-sm font-medium text-gray-700">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="ship_to_zip"
                      id="ship_to_zip"
                      value={formData.ship_to_zip}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="ship_to_country" className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <input
                      type="text"
                      name="ship_to_country"
                      id="ship_to_country"
                      value={formData.ship_to_country}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="carrier" className="block text-sm font-medium text-gray-700">
                      Carrier
                    </label>
                    <input
                      type="text"
                      name="carrier"
                      id="carrier"
                      value={formData.carrier}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Package Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Package Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="weight_lb" className="block text-sm font-medium text-gray-700">
                      Weight (lb)
                    </label>
                    <input
                      type="number"
                      name="weight_lb"
                      id="weight_lb"
                      value={formData.weight_lb}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="volume_cuft" className="block text-sm font-medium text-gray-700">
                      Volume (cuft)
                    </label>
                    <input
                      type="number"
                      name="volume_cuft"
                      id="volume_cuft"
                      value={formData.volume_cuft}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="packages" className="block text-sm font-medium text-gray-700">
                      Packages
                    </label>
                    <input
                      type="number"
                      name="packages"
                      id="packages"
                      value={formData.packages}
                      onChange={handleChange}
                      min="0"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* SKU Quantities */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">SKU Quantities</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                        SKU
                      </label>
                      <input
                        type="text"
                        id="sku"
                        value={skuInput.sku}
                        onChange={(e) => setSkuInput(prev => ({ ...prev, sku: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                        Quantity
                      </label>
                      <input
                        type="number"
                        id="quantity"
                        value={skuInput.quantity}
                        onChange={(e) => setSkuInput(prev => ({ ...prev, quantity: e.target.value }))}
                        min="1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleSkuAdd}
                        className="mb-0.5 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Add SKU
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    {Object.entries(formData.sku_quantity).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(formData.sku_quantity).map(([sku, qty]) => (
                          <div key={sku} className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900">{sku}</span>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-500">{qty}</span>
                              <button
                                type="button"
                                onClick={() => handleSkuRemove(sku)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No SKUs added</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  name="notes"
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3">
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
      </div>
    </div>
  );
};

OrderForm.propTypes = {
  order: PropTypes.shape({
    transaction_id: PropTypes.number,
    customer: PropTypes.number,
    reference_number: PropTypes.string,
    status: PropTypes.oneOf(['draft', 'submitted', 'shipped', 'delivered', 'cancelled']),
    priority: PropTypes.oneOf(['low', 'medium', 'high']),
    ship_to_name: PropTypes.string,
    ship_to_company: PropTypes.string,
    ship_to_address: PropTypes.string,
    ship_to_address2: PropTypes.string,
    ship_to_city: PropTypes.string,
    ship_to_state: PropTypes.string,
    ship_to_zip: PropTypes.string,
    ship_to_country: PropTypes.string,
    weight_lb: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    volume_cuft: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    packages: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    carrier: PropTypes.string,
    notes: PropTypes.string,
    sku_quantity: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])),
  }),
  onClose: PropTypes.func.isRequired,
};

export default OrderForm;
