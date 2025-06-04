require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

// Debug: Log environment variables (without sensitive data)
console.log('Environment variables loaded:', {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? '**present**' : '**missing**',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? '**present**' : '**missing**',
});

// Routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 