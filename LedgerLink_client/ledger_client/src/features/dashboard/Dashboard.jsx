// src/features/dashboard/Dashboard.jsx
import DashboardStats from './components/DashboardStats';
import RecentCustomers from './components/RecentCustomers';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
          </h2>
        </div>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentCustomers />
        {/* Add more dashboard widgets here */}
      </div>
    </div>
  );
};

export default Dashboard;