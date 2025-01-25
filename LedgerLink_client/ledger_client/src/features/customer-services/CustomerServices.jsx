// src/features/customer-services/CustomerServices.jsx
import CustomerServiceList from './components/CustomerServiceList';

const CustomerServices = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Customer Services</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all customer services including assigned services, pricing, and SKU associations.
          </p>
        </div>
      </div>
      <CustomerServiceList />
    </div>
  );
};

export default CustomerServices;
