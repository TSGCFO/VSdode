// src/features/dashboard/components/RecentCustomers.jsx
const RecentCustomers = () => {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Recent Customers
        </h3>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {/* Add customer list items here */}
        </ul>
      </div>
    </div>
  );
};

export default RecentCustomers;