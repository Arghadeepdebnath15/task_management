import axios from 'axios';

// API URL configuration
const LOCAL_URL = 'http://localhost:5000';
const PRODUCTION_URL = 'https://task-management-0dpa.onrender.com';

// Select appropriate API URL based on environment
const API_URL = window.location.hostname === 'localhost' ? LOCAL_URL : PRODUCTION_URL;

console.log('Base API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Request interceptor
api.interceptors.request.use((config) => {
  // Ensure API paths are correct
  const path = config.url.startsWith('/api/') ? config.url : `/api${config.url}`;
  config.url = path;
  
  // Log the full request URL and headers
  console.log('Request details:', {
    url: `${config.baseURL}${config.url}`,
    method: config.method,
    headers: config.headers,
    data: config.data
  });
  
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('Request error details:', {
    message: error.message,
    code: error.code,
    stack: error.stack
  });
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response details:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Detailed error logging
    console.error('Response error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers,
        data: error.config?.data
      }
    });

    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - server took too long to respond');
    }

    if (!error.response) {
      throw new Error('Network error - cannot connect to server. Is the backend running?');
    }

    if (error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error(error.response.data?.message || 'Authentication failed');
    }

    throw new Error(error.response.data?.message || error.message || 'An error occurred');
  }
);

export const auth = {
  register: async (formData) => {
    try {
      console.log('Registration details:', {
        username: formData.get('username'),
        email: formData.get('email'),
        hasPassword: !!formData.get('password'),
        hasProfilePicture: !!formData.get('profilePicture')
      });
      
      const response = await api.post('/api/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 15000 // 15 seconds for registration
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      console.error('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      console.log('Login request details:', {
        email: credentials.email,
        hasPassword: !!credentials.password,
        timestamp: new Date().toISOString()
      });
      
      const response = await api.post('/api/auth/login', credentials);

      console.log('Login response details:', {
        status: response.status,
        hasToken: !!response.data.token,
        hasUser: !!response.data.user
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        },
        request: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          headers: error.config?.headers
        },
        stack: error.stack
      });
      throw error;
    }
  },

  updateProfile: async (formData) => {
    const response = await api.patch('/auth/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getUserStats: async () => {
    const response = await api.get('/auth/stats');
    return response;
  },
};

export const tasks = {
  create: async (taskData) => {
    try {
      console.log('Creating new task...');
      const response = await api.post('/api/tasks', taskData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      console.log('Fetching all tasks...');
      const response = await api.get('/api/tasks');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      throw error;
    }
  },

  update: async (id, taskData) => {
    try {
      console.log('Updating task:', id);
      const headers = taskData instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' };

      const response = await api.patch(`/api/tasks/${id}`, taskData, { headers });
      return response.data;
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      console.log('Deleting task:', id);
      const response = await api.delete(`/api/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  },
};

export default api; 