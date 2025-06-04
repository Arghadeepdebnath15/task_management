const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Task = require('../models/Task');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const auth = require('../middleware/auth');

// Multer configuration for file upload
const upload = multer({ storage: multer.memoryStorage() });

// Register new user
router.post('/register', upload.single('profilePicture'), async (req, res) => {
  try {
    console.log('Registration attempt:', { 
      username: req.body.username,
      email: req.body.email,
      hasPassword: !!req.body.password,
      hasFile: !!req.file
    });

    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      console.log('Missing required fields:', { username: !!username, email: !!email, password: !!password });
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log('User already exists:', { email, username });
      return res.status(400).json({ message: 'User already exists' });
    }

    let profilePicture = {};
    if (req.file) {
      // Convert buffer to base64
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      
      // Upload to cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'profile_pictures'
      });
      
      profilePicture = {
        public_id: result.public_id,
        url: result.secure_url
      };
    }

    const user = new User({
      username,
      email,
      password,
      profilePicture
    });

    await user.save();
    console.log('User created successfully:', { id: user._id, username: user.username, email: user.email });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', { 
      email: req.body.email,
      hasPassword: !!req.body.password 
    });

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing login credentials:', { email: !!email, password: !!password });
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', { email });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Invalid password for user:', { email });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Login successful:', { id: user._id, username: user.username, email: user.email });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Update user profile
router.patch('/profile', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    console.log('Received profile update request:', {
      body: req.body,
      file: req.file ? { ...req.file, buffer: 'Buffer data...' } : null
    });

    const { username, bio } = req.body;
    const updates = { username, bio };

    // Handle profile picture upload if provided
    if (req.file) {
      console.log('Processing profile picture upload...');
      // Delete old profile picture from Cloudinary if exists
      if (req.user.profilePicture?.public_id) {
        console.log('Deleting old profile picture:', req.user.profilePicture.public_id);
        await cloudinary.uploader.destroy(req.user.profilePicture.public_id);
      }

      // Convert buffer to base64
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      
      console.log('Uploading to Cloudinary...');
      // Upload to cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'profile_pictures'
      });
      console.log('Cloudinary upload result:', result);
      
      updates.profilePicture = {
        public_id: result.public_id,
        url: result.secure_url
      };
    }

    console.log('Updating user with:', updates);
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    console.log('Updated user:', user);
    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({ message: 'Error updating profile', error: error.message });
  }
});

// Get user stats
router.get('/stats', auth, async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments({ user: req.user._id });
    const completedTasks = await Task.countDocuments({ 
      user: req.user._id,
      status: 'completed'
    });
    const inProgressTasks = await Task.countDocuments({ 
      user: req.user._id,
      status: 'in-progress'
    });

    res.json({
      totalTasks,
      completedTasks,
      inProgressTasks
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

module.exports = router; 