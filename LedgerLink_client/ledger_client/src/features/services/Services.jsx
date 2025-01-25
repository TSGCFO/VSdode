// src/features/services/Services.jsx
import ServiceList from './components/ServiceList';

const Services = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Services</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all services including their names, descriptions, and charge types.
          </p>
        </div>
      </div>
      <ServiceList />
    </div>
  );
};

export default Services;
