// src/features/orders/components/OrderDetails.jsx
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../../../services/api';
import PropTypes from 'prop-types';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const colors = {
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    shipped: 'bg-yellow-100 text-yellow-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const color = colors[status] || colors.draft;

  return (
    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${color}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.oneOf(['draft', 'submitted', 'shipped', 'delivered', 'cancelled']),
};

const PriorityBadge = ({ priority }) => {
  if (!priority) return null;

  const colors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const color = colors[priority] || colors.medium;

  return (
    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${color}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

PriorityBadge.propTypes = {
  priority: PropTypes.oneOf(['low', 'medium', 'high']),
};

const OrderDetails = ({ orderId, onClose }) => {
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApi.getOrderById(orderId),
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg max-w-2xl mx-auto w-full">
          Loading order details...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg max-w-2xl mx-auto w-full">
          Error loading order details.
        </div>
      </div>
    );
  }

  const renderSkuQuantities = () => {
    if (!order.sku_quantity) return <p className="text-sm text-gray-500">No SKUs assigned</p>;

    // Convert SKU quantities to a consistent format
    const skuQuantities = Object.entries(order.sku_quantity).map(([sku, value]) => ({
      sku,
      quantity: typeof value === 'object' ? Number(value.quantity) : Number(value),
      productDetails: order.product_details?.[sku],
    }));

    if (skuQuantities.length === 0) return <p className="text-sm text-gray-500">No SKUs assigned</p>;

    return (
      <div className="space-y-2">
        {skuQuantities.map(({ sku, quantity, productDetails }) => {
          const productName = productDetails?.name || sku;

          return (
            <div key={sku} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{productName}</span>
                <span className="text-gray-500">×</span>
                <span className="text-gray-900">{quantity}</span>
              </div>
              {productDetails?.name !== sku && (
                <span className="text-gray-500">{sku}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          {/* Fixed Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
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
              {/* Order Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Order Information</h3>
                <div className="bg-gray-50 px-4 py-3 rounded-lg">
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Transaction ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">{order.transaction_id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Reference Number</dt>
                      <dd className="mt-1 text-sm text-gray-900">{order.reference_number}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1">
                        <StatusBadge status={order.status} />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Priority</dt>
                      <dd className="mt-1">
                        <PriorityBadge priority={order.priority} />
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Information</h3>
                <div className="bg-gray-50 px-4 py-3 rounded-lg">
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Company Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{order.customer_details?.company_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{order.customer_details?.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="mt-1 text-sm text-gray-900">{order.customer_details?.phone || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Shipping Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Shipping Information</h3>
                <div className="bg-gray-50 px-4 py-3 rounded-lg">
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Ship To Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{order.ship_to_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Ship To Company</dt>
                      <dd className="mt-1 text-sm text-gray-900">{order.ship_to_company}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Address</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {[
                          order.ship_to_address,
                          order.ship_to_address2,
                          order.ship_to_city,
                          order.ship_to_state,
                          order.ship_to_zip,
                          order.ship_to_country,
                        ].filter(Boolean).join(', ')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Carrier</dt>
                      <dd className="mt-1 text-sm text-gray-900">{order.carrier || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Package Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Package Details</h3>
                <div className="bg-gray-50 px-4 py-3 rounded-lg">
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Weight (lb)</dt>
                      <dd className="mt-1 text-sm text-gray-900">{order.weight_lb || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Volume (cuft)</dt>
                      <dd className="mt-1 text-sm text-gray-900">{order.volume_cuft || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Total Items</dt>
                      <dd className="mt-1 text-sm text-gray-900">{order.total_item_qty}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Packages</dt>
                      <dd className="mt-1 text-sm text-gray-900">{order.packages || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* SKU Quantities */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Products</h3>
                <div className="bg-gray-50 px-4 py-3 rounded-lg">
                  {renderSkuQuantities()}
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
                  <div className="bg-gray-50 px-4 py-3 rounded-lg">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{order.notes}</p>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">History</h3>
                <div className="bg-gray-50 px-4 py-3 rounded-lg">
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Close Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {order.close_date ? new Date(order.close_date).toLocaleString() : 'N/A'}
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

OrderDetails.propTypes = {
  orderId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default OrderDetails;
