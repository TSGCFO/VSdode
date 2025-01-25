// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', path: '/', icon: '📊' },
  { name: 'Customers', path: '/customers', icon: '👥' },
  { name: 'Customer Services', path: '/customer-services', icon: '📋' },
  { name: 'Orders', path: '/orders', icon: '📦' },
  { name: 'Products', path: '/products', icon: '🏷️' },
  { name: 'Reports', path: '/reports', icon: '📈' },
];

const Sidebar = () => {
  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow border-r border-gray-200 bg-white pt-5 overflow-y-auto">
        <div className="flex flex-shrink-0 items-center px-4">
          {/* Add your logo here */}
          <img
            className="h-8 w-auto"
            src="/path-to-your-logo.svg"
            alt="LedgerLink"
          />
        </div>
        <div className="mt-5 flex flex-grow flex-col">
          <nav className="flex-1 space-y-1 px-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
