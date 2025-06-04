import axios from 'axios';

// API URL configuration
const RENDER_URL = 'https://task-management-0dpa.onrender.com';
const LOCAL_URL = 'http://localhost:5000';

const API_URL = import.meta.env.PROD ? RENDER_URL : LOCAL_URL;

console.log('Environment:', import.meta.env.PROD ? 'production' : 'development');
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
  // Log the full request URL
  console.log('Making request to:', `${config.baseURL}${config.url}`);
  
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - server took too long to respond');
    }

    if (!error.response) {
      throw new Error('Network error - cannot connect to server');
    }

    if (error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    throw error;
  }
);

export const auth = {
  register: async (formData) => {
    try {
      console.log('Starting registration process...');
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
      console.error('Registration failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      console.log('Starting login process...');
      const response = await api.post('/api/auth/login', credentials);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      console.error('Login failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
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
    const response = await api.post('/tasks', taskData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },

  update: async (id, taskData) => {
    // If taskData is FormData (contains files), use multipart/form-data
    const headers = taskData instanceof FormData
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' };

    const response = await api.patch(`/tasks/${id}`, taskData, { headers });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};

export default api; 