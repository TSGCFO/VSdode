// src/routes/index.jsx
import { createBrowserRouter } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Dashboard from '../features/dashboard/Dashboard';
import CustomerList from '../features/customers/components/CustomerList';
import CustomerForm from '../features/customers/components/CustomerForm';
import CustomerDetails from '../features/customers/components/CustomerDetails';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        path: '/',
        element: <Dashboard />
      },
      {
        path: 'customers',
        children: [
          {
            path: '',
            element: <CustomerList />
          },
          {
            path: 'new',
            element: <CustomerForm />
          },
          {
            path: ':id',
            element: <CustomerDetails />
          },
          {
            path: ':id/edit',
            element: <CustomerForm />
          }
        ]
      }
    ]
  }
]);