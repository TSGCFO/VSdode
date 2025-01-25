// src/services/api.js
import axios from 'axios';

// Create axios instance with interceptors for debugging
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.data);
    return response;
  },
  (error) => {
    console.error('Response Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return Promise.reject(error);
  }
);

export const orderApi = {
  getOrders: async (params = {}) => {
    try {
      const response = await api.get('/orders/api/', {
        params: {
          ...params,
          ordering: params.ordering || '-transaction_id',
        },
      });
      return response.data;
    } catch (error) {
      console.error('getOrders Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/orders/api/${id}/`);
      return response.data;
    } catch (error) {
      console.error('getOrderById Error:', error);
      throw error;
    }
  },
  createOrder: async (data) => {
    try {
      const response = await api.post('/orders/api/', data);
      return response.data;
    } catch (error) {
      console.error('createOrder Error:', error);
      throw error;
    }
  },
  updateOrder: async (id, data) => {
    try {
      const response = await api.put(`/orders/api/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('updateOrder Error:', error);
      throw error;
    }
  },
  deleteOrder: async (id) => {
    try {
      await api.delete(`/orders/api/${id}/`);
    } catch (error) {
      console.error('deleteOrder Error:', error);
      throw error;
    }
  },
  // Advanced filtering methods
  filterOrders: async (filters = {}) => {
    try {
      const response = await api.get('/orders/api/', {
        params: {
          ...filters,
          ordering: filters.ordering || '-transaction_id',
        },
      });
      return response.data;
    } catch (error) {
      console.error('filterOrders Error:', error);
      throw error;
    }
  },
  searchOrders: async (query) => {
    try {
      const response = await api.get('/orders/api/', {
        params: {
          search: query,
        },
      });
      return response.data;
    } catch (error) {
      console.error('searchOrders Error:', error);
      throw error;
    }
  },
};

export const customerServiceApi = {
  getCustomerServices: async (params = {}) => {
    try {
      const response = await api.get('/customer_services/api/', {
        params: {
          ...params,
          ordering: params.ordering || '-created_at',
        },
      });
      return response.data;
    } catch (error) {
      console.error('getCustomerServices Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },
  getCustomerServiceById: async (id) => {
    try {
      const response = await api.get(`/customer_services/api/${id}/`);
      return response.data;
    } catch (error) {
      console.error('getCustomerServiceById Error:', error);
      throw error;
    }
  },
  createCustomerService: async (data) => {
    try {
      const response = await api.post('/customer_services/api/', data);
      return response.data;
    } catch (error) {
      console.error('createCustomerService Error:', error);
      throw error;
    }
  },
  updateCustomerService: async (id, data) => {
    try {
      const response = await api.put(`/customer_services/api/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('updateCustomerService Error:', error);
      throw error;
    }
  },
  deleteCustomerService: async (id) => {
    try {
      await api.delete(`/customer_services/api/${id}/`);
    } catch (error) {
      console.error('deleteCustomerService Error:', error);
      throw error;
    }
  },
  getCustomerSkus: async (customerId) => {
    try {
      const response = await api.get(`/customer_services/api/customer-skus/${customerId}/`);
      return response.data;
    } catch (error) {
      console.error('getCustomerSkus Error:', error);
      throw error;
    }
  },
  // Advanced filtering methods
  filterCustomerServices: async (filters = {}) => {
    try {
      const response = await api.get('/customer_services/api/', {
        params: {
          ...filters,
          ordering: filters.ordering || '-created_at',
        },
      });
      return response.data;
    } catch (error) {
      console.error('filterCustomerServices Error:', error);
      throw error;
    }
  },
  searchCustomerServices: async (query) => {
    try {
      const response = await api.get('/customer_services/api/', {
        params: {
          search: query,
        },
      });
      return response.data;
    } catch (error) {
      console.error('searchCustomerServices Error:', error);
      throw error;
    }
  },
};

export const serviceApi = {
  getServices: async (params = {}) => {
    try {
      const response = await api.get('/services/api/', {
        params: {
          ...params,
          ordering: params.ordering || 'service_name',
        },
      });
      return response.data;
    } catch (error) {
      console.error('getServices Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },
  getServiceById: async (id) => {
    try {
      const response = await api.get(`/services/api/${id}/`);
      return response.data;
    } catch (error) {
      console.error('getServiceById Error:', error);
      throw error;
    }
  },
  createService: async (data) => {
    try {
      const response = await api.post('/services/api/', data);
      return response.data;
    } catch (error) {
      console.error('createService Error:', error);
      throw error;
    }
  },
  updateService: async (id, data) => {
    try {
      const response = await api.put(`/services/api/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('updateService Error:', error);
      throw error;
    }
  },
  deleteService: async (id) => {
    try {
      await api.delete(`/services/api/${id}/`);
    } catch (error) {
      console.error('deleteService Error:', error);
      throw error;
    }
  },
  // Advanced filtering methods
  filterServices: async (filters = {}) => {
    try {
      const response = await api.get('/services/api/', {
        params: {
          ...filters,
          ordering: filters.ordering || 'service_name',
        },
      });
      return response.data;
    } catch (error) {
      console.error('filterServices Error:', error);
      throw error;
    }
  },
  searchServices: async (query) => {
    try {
      const response = await api.get('/services/api/', {
        params: {
          search: query,
        },
      });
      return response.data;
    } catch (error) {
      console.error('searchServices Error:', error);
      throw error;
    }
  },
};

export const productApi = {
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/products/api/', {
        params: {
          ...params,
          ordering: params.ordering || 'sku',
        },
      });
      return response.data;
    } catch (error) {
      console.error('getProducts Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/api/${id}/`);
      return response.data;
    } catch (error) {
      console.error('getProductById Error:', error);
      throw error;
    }
  },
  createProduct: async (data) => {
    try {
      const response = await api.post('/products/api/', data);
      return response.data;
    } catch (error) {
      console.error('createProduct Error:', error);
      throw error;
    }
  },
  updateProduct: async (id, data) => {
    try {
      const response = await api.put(`/products/api/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('updateProduct Error:', error);
      throw error;
    }
  },
  deleteProduct: async (id) => {
    try {
      await api.delete(`/products/api/${id}/`);
    } catch (error) {
      console.error('deleteProduct Error:', error);
      throw error;
    }
  },
  // Advanced filtering methods
  filterProducts: async (filters = {}) => {
    try {
      const response = await api.get('/products/api/', {
        params: {
          ...filters,
          ordering: filters.ordering || 'sku',
        },
      });
      return response.data;
    } catch (error) {
      console.error('filterProducts Error:', error);
      throw error;
    }
  },
  searchProducts: async (query) => {
    try {
      const response = await api.get('/products/api/', {
        params: {
          search: query,
        },
      });
      return response.data;
    } catch (error) {
      console.error('searchProducts Error:', error);
      throw error;
    }
  },
};

export const customerApi = {
  getCustomers: async (params = {}) => {
    try {
      const response = await api.get('/customers/api/', { params: { ...params,
        ordering: params.ordering || 'company_name'} });
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('getCustomers Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },
  getCustomerById: async (id) => {
    try {
      const response = await api.get(`/customers/api/${id}/`);
      return response.data;
    } catch (error) {
      console.error('getCustomerById Error:', error);
      throw error;
    }
  },
  createCustomer: async (data) => {
    try {
      const response = await api.post('/customers/api/', data);
      return response.data;
    } catch (error) {
      console.error('createCustomer Error:', error);
      throw error;
    }
  },
  updateCustomer: async (id, data) => {
    try {
      const response = await api.put(`/customers/api/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('updateCustomer Error:', error);
      throw error;
    }
  },
  deleteCustomer: async (id) => {
    try {
      await api.delete(`/customers/api/${id}/`);
    } catch (error) {
      console.error('deleteCustomer Error:', error);
      throw error;
    }
  },
};
