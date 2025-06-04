import axios from 'axios';

// API URL configuration
const RENDER_URL = 'https://task-management-0dpa.onrender.com';
const LOCAL_URL = 'http://localhost:5000';

// Force production URL when deployed to Netlify
const isProduction = window.location.hostname.includes('netlify.app');
const API_URL = isProduction ? RENDER_URL : LOCAL_URL;

console.log('Environment:', isProduction ? 'production' : 'development');
console.log('Base API URL:', API_URL);
console.log('Hostname:', window.location.hostname);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Changed to false since we're using token auth
  timeout: 15000, // Increased timeout to 15 seconds
});

// Request interceptor
api.interceptors.request.use((config) => {
  // Ensure API paths are correct
  const path = config.url.startsWith('/api/') ? config.url : `/api${config.url}`;
  config.url = path;
  
  // Log the full request URL
  console.log('Making request to:', `${config.baseURL}${config.url}`);
  
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Set specific headers for production
  if (isProduction) {
    config.headers['Origin'] = 'https://task-management-0dpa.netlify.app';
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