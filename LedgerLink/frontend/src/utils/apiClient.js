import { getAccessToken, refreshAccessToken, logout } from './auth';

const API_BASE_URL = '/api/v1';

/**
 * Generic request handler with error handling and token management
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    console.log('Making API request to:', url);
    const response = await fetch(url, { ...options, headers });
    console.log('API response status:', response.status);
    
    if (response.status === 401) {
      // Token might be expired, try to refresh
      try {
        const newToken = await refreshAccessToken();
        // Retry the request with new token
        const newHeaders = {
          ...headers,
          'Authorization': `Bearer ${newToken}`,
        };
        const retryResponse = await fetch(url, { ...options, headers: newHeaders });
        const data = await retryResponse.json();

        if (!retryResponse.ok) {
          throw {
            status: retryResponse.status,
            message: data.detail || 'An error occurred',
          };
        }

        return data;
      } catch (refreshError) {
        // If refresh fails, log out the user
        logout();
        throw { status: 401, message: 'Session expired. Please log in again.' };
      }
    }

    try {
      const data = await response.json();
      console.log('API response data:', data);

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.detail || data.message || 'An error occurred',
        };
      }

      return data;
    } catch (jsonError) {
      // Handle non-JSON responses
      throw {
        status: response.status,
        message: 'Invalid response from server',
      };
    }
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

/**
 * Customer API endpoints
 */
export const customerApi = {
  list: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.business_type) queryParams.append('business_type', params.business_type);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return request(`/customers/${query}`);
  },
  get: (id) => request(`/customers/${id}/`),
  create: (data) => request('/customers/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => request(`/customers/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => request(`/customers/${id}/`, {
    method: 'DELETE',
  }),
};

/**
 * Customer Services API endpoints
 */
export const customerServiceApi = {
  list: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.customer) queryParams.append('customer', params.customer);
    if (params.service) queryParams.append('service', params.service);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return request(`/customer-services/${query}`);
  },
  get: (id) => request(`/customer-services/${id}/`),
  create: (data) => request('/customer-services/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => request(`/customer-services/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => request(`/customer-services/${id}/`, {
    method: 'DELETE',
  }),
  addSkus: (id, data) => request(`/customer-services/${id}/add_skus/`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

/**
 * Services API endpoints
 */
export const serviceApi = {
  list: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.charge_type) queryParams.append('charge_type', params.charge_type);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return request(`/services/${query}`);
  },
  get: (id) => request(`/services/${id}/`),
  create: (data) => request('/services/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => request(`/services/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => request(`/services/${id}/`, {
    method: 'DELETE',
  }),
  getChargeTypes: () => request('/services/charge_types/'),
};

/**
 * Products API endpoints
 */
export const productApi = {
  list: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.customer) queryParams.append('customer', params.customer);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return request(`/products/${query}`);
  },
  getStats: () => request('/products/stats/'),
  get: (id) => request(`/products/${id}/`),
  create: (data) => request('/products/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => request(`/products/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => request(`/products/${id}/`, {
    method: 'DELETE',
  }),
  getSkusByCustomer: (customerId) => request(`/products/?customer=${customerId}`),
};

/**
 * Orders API endpoints
 */
export const orderApi = {
  list: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return request(`/orders/${query}`);
  },
  get: (id) => request(`/orders/${id}/`),
  create: (data) => request('/orders/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => request(`/orders/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => request(`/orders/${id}/`, {
    method: 'DELETE',
  }),
  cancel: (id) => request(`/orders/${id}/cancel/`, {
    method: 'POST',
  }),
  getChoices: () => request('/orders/choices/'),
  getStatusCounts: () => request('/orders/status_counts/'),
};

/**
 * Inserts API endpoints
 */
export const insertApi = {
  list: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.customer) queryParams.append('customer', params.customer);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return request(`/inserts/${query}`);
  },
  get: (id) => request(`/inserts/${id}/`),
  create: (data) => request('/inserts/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => request(`/inserts/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => request(`/inserts/${id}/`, {
    method: 'DELETE',
  }),
  getStats: () => request('/inserts/stats/'),
  updateQuantity: (id, quantity, operation) => request(`/inserts/${id}/update_quantity/`, {
    method: 'POST',
    body: JSON.stringify({ quantity, operation }),
  }),
};

/**
 * CAD Shipping API endpoints
 */
export const cadShippingApi = {
  list: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return request(`/shipping/cad/${query}`);
  },
  get: (id) => request(`/shipping/cad/${id}/`),
  create: (data) => request('/shipping/cad/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => request(`/shipping/cad/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => request(`/shipping/cad/${id}/`, {
    method: 'DELETE',
  }),
};

/**
 * US Shipping API endpoints
 */
export const usShippingApi = {
  list: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return request(`/shipping/us/${query}`);
  },
  get: (id) => request(`/shipping/us/${id}/`),
  create: (data) => request('/shipping/us/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => request(`/shipping/us/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => request(`/shipping/us/${id}/`, {
    method: 'DELETE',
  }),
};

export const handleApiError = (error) => {
  if (!error) {
    return 'An unknown error occurred.';
  }

  // Handle network errors
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'Network error. Please check your connection.';
  }

  switch (error.status) {
    case 404:
      return 'The requested resource was not found.';
    case 401:
      return 'Please log in to continue.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 400:
      return error.message || 'Invalid request. Please check your input.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred. Please try again later.';
  }
};

export default {
  customerApi,
  customerServiceApi,
  serviceApi,
  productApi,
  orderApi,
  insertApi,
  cadShippingApi,
  usShippingApi,
  handleApiError,
};