// src/features/customer-services/components/CustomerServiceDetails.jsx
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { customerServiceApi } from '../../../services/api';
import PropTypes from 'prop-types';

const CustomerServiceDetails = ({ customerServiceId, onClose }) => {
  const { data: customerService, isLoading, isError } = useQuery({
    queryKey: ['customerService', customerServiceId],
    queryFn: () => customerServiceApi.getCustomerServiceById(customerServiceId),
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg max-w-2xl mx-auto w-full">
          <div className="animate-pulse space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">✕</button>
            </div>
            <div className="space-y-6">
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/6 mb-2"></div>
                <div className="bg-gray-50 px-4 py-3 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i}>
                        <div className="h-3 bg-gray-200 rounded w-1/4 mb-1"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/6 mb-2"></div>
                <div className="bg-gray-50 px-4 py-3 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i}>
                        <div className="h-3 bg-gray-200 rounded w-1/4 mb-1"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg max-w-2xl mx-auto w-full">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">Error loading customer service details</div>
            <button
              onClick={onClose}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          {/* Fixed Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Customer Service Details</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Information</h3>
                <div className="bg-gray-50 px-4 py-3 rounded-lg">
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Company Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <Link
                          to={`/customers/${customerService.customer}`}
                          className="text-indigo-600 hover:underline"
                        >
                          {customerService.customer_name}
                        </Link>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Service Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Service Information</h3>
                <div className="bg-gray-50 px-4 py-3 rounded-lg">
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Service Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <Link
                          to={`/services/${customerService.service}`}
                          className="text-indigo-600 hover:underline"
                        >
                          {customerService.service_name}
                        </Link>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Pricing and SKUs */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Pricing and SKUs</h3>
                <div className="bg-gray-50 px-4 py-3 rounded-lg">
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Unit Price</dt>
                      <dd className="mt-1 text-sm text-gray-900">${customerService.unit_price}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">SKU Count</dt>
                      <dd className="mt-1 text-sm text-gray-900">{customerService.sku_list.length}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Associated SKUs</dt>
                      <dd className="mt-1">
                        {customerService.sku_list.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
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
                          <span className="text-sm text-gray-500">No SKUs assigned</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">History</h3>
                <div className="bg-gray-50 px-4 py-3 rounded-lg">
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created At</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(customerService.created_at).toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(customerService.updated_at).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

CustomerServiceDetails.propTypes = {
  customerServiceId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CustomerServiceDetails;
