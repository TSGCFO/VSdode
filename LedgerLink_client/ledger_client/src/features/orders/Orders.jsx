// src/features/orders/Orders.jsx
import OrderList from './components/OrderList';

const Orders = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all orders including customer details, shipping information, and status.
          </p>
        </div>
      </div>
      <OrderList />
    </div>
  );
};

export default Orders;
