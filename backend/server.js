require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

// Debug: Log environment variables (without sensitive data)
console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? '**present**' : '**missing**',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? '**present**' : '**missing**',
});

// Routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.method !== 'OPTIONS') {
    console.log('Body:', req.body);
  }
  next();
});

// CORS configuration
const allowedOrigins = [
  'https://task-management-0dpa.netlify.app',
  'http://localhost:5173',
  'http://localhost:5174'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('Request has no origin');
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('Origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('Origin not allowed:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    cors: {
      allowedOrigins,
      methods: corsOptions.methods,
      headers: corsOptions.allowedHeaders
    }
  });
});

// Root API route with detailed information
app.get('/api', (req, res) => {
  res.json({
    message: 'Task Management API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    cors: {
      allowedOrigins,
      methods: corsOptions.methods,
      headers: corsOptions.allowedHeaders
    },
    endpoints: {
      auth: {
        login: { 
          path: '/api/auth/login',
          method: 'POST',
          description: 'User login endpoint'
        },
        register: {
          path: '/api/auth/register',
          method: 'POST',
          description: 'User registration endpoint'
        },
        profile: {
          path: '/api/auth/profile',
          method: 'PATCH',
          description: 'Update user profile'
        },
        stats: {
          path: '/api/auth/stats',
          method: 'GET',
          description: 'Get user statistics'
        }
      },
      tasks: {
        list: {
          path: '/api/tasks',
          method: 'GET',
          description: 'List all tasks'
        },
        create: {
          path: '/api/tasks',
          method: 'POST',
          description: 'Create new task'
        },
        update: {
          path: '/api/tasks/:id',
          method: 'PATCH',
          description: 'Update existing task'
        },
        delete: {
          path: '/api/tasks/:id',
          method: 'DELETE',
          description: 'Delete task'
        }
      }
    }
  });
});

// Handle 404 errors with more information
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    message: 'Route not found',
    requestedPath: req.url,
    method: req.method,
    availableRoutes: {
      auth: '/api/auth/*',
      tasks: '/api/tasks/*',
      health: '/health',
      api: '/api'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.url,
    method: req.method
  });
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      message: 'CORS error',
      error: 'Origin not allowed',
      allowedOrigins
    });
  }
  
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: err.message,
    path: req.url
  });
});

// Cloudinary Configuration
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  console.log('Configuring Cloudinary...');
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  
  // Verify Cloudinary configuration
  cloudinary.api.ping()
    .then(() => console.log('Cloudinary configuration verified successfully'))
    .catch(error => console.error('Cloudinary configuration error:', error));
} else {
  console.error('Cloudinary configuration is missing. Required environment variables:');
  console.error('- CLOUDINARY_CLOUD_NAME');
  console.error('- CLOUDINARY_API_KEY');
  console.error('- CLOUDINARY_API_SECRET');
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://2023422375arghadeep:SjEckjBfyu8ECtBD@cluster0.y1rybwu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Allowed Origins:', allowedOrigins);
}); 