import axios from 'axios';

// Get the API URL from environment variables, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('API URL:', API_URL); // For debugging

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Enable sending cookies in cross-origin requests
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token ? 'Present' : 'Not found');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Setting Authorization header:', `Bearer ${token}`);
  }
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('401 error detected, clearing auth data');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  register: async (formData) => {
    const response = await api.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    // Store token immediately after successful login
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
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