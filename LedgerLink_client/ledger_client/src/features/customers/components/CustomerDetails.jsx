// src/features/customers/components/CustomerDetails.jsx
import { useQuery } from '@tanstack/react-query';
import { customerApi } from '../../../services/api';
import PropTypes from 'prop-types';

const CustomerDetails = ({ customerId, onClose }) => {
  const { data: customer, isLoading, isError } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customerApi.getCustomerById(customerId),
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg max-w-2xl mx-auto w-full">
          Loading customer details...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg max-w-2xl mx-auto w-full">
          Error loading customer details.
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Customer Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 bg-gray-50 px-4 py-2 rounded">
            <p className="text-sm font-medium text-gray-500">Customer ID</p>
            <p className="mt-1 text-sm text-gray-900">{customer.id}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Company Name</p>
            <p className="mt-1 text-sm text-gray-900">{customer.company_name}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Legal Business Name</p>
            <p className="mt-1 text-sm text-gray-900">{customer.legal_business_name}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="mt-1 text-sm text-gray-900">{customer.email}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Phone</p>
            <p className="mt-1 text-sm text-gray-900">{customer.phone}</p>
          </div>

          <div className="col-span-2">
            <p className="text-sm font-medium text-gray-500">Address</p>
            <p className="mt-1 text-sm text-gray-900">{customer.address}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">City</p>
            <p className="mt-1 text-sm text-gray-900">{customer.city}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">State</p>
            <p className="mt-1 text-sm text-gray-900">{customer.state}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Country</p>
            <p className="mt-1 text-sm text-gray-900">{customer.country}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Business Type</p>
            <p className="mt-1 text-sm text-gray-900">{customer.business_type}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <p className="mt-1">
              <span
                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  customer.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {customer.is_active ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Created At</p>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(customer.created_at).toLocaleString()}
            </p>
          </div>

          {customer.updated_at && (
            <div>
              <p className="text-sm font-medium text-gray-500">Last Updated</p>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(customer.updated_at).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

CustomerDetails.propTypes = {
  customerId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CustomerDetails;