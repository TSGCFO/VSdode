// src/features/services/components/ServiceDetails.jsx
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { serviceApi } from '../../../services/api';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: service, isLoading, isError } = useQuery({
    queryKey: ['service', id],
    queryFn: () => serviceApi.getServiceById(id),
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading service details</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          ← Back
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900">Service Details</h2>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 bg-gray-50 px-4 py-2 rounded">
              <p className="text-sm font-medium text-gray-500">Service ID</p>
              <p className="mt-1 text-sm text-gray-900">{service.id}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Service Name</p>
              <p className="mt-1 text-sm text-gray-900">{service.service_name}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Charge Type</p>
              <p className="mt-1">
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    service.charge_type === 'single'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {service.charge_type === 'single' ? 'Single Charge' : 'Quantity Based'}
                </span>
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500">Description</p>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {service.description || 'No description provided'}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Created At</p>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(service.created_at).toLocaleString()}
              </p>
            </div>

            {service.updated_at && (
              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(service.updated_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Usage Information</h3>
          <div className="bg-yellow-50 p-4 rounded">
            <p className="text-sm text-yellow-700">
              {service.charge_type === 'single'
                ? 'This service is billed as a single charge per use.'
                : 'This service is billed based on quantity/usage.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
