// src/features/dashboard/components/DashboardStats.jsx
const DashboardStats = () => {
  const stats = [
    { name: 'Total Customers', value: '120' },
    { name: 'Active Orders', value: '45' },
    { name: 'Monthly Revenue', value: '$12,345' },
    { name: 'Products', value: '89' },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              {stat.name}
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stat.value}
            </dd>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;