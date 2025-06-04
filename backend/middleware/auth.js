const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Use the new JWT secret
const JWT_SECRET = '3e8dd906a8c1cf21785f9b5142d802f4eb0c13a4387c44b7b6e808ebe4e9eaf2';

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token using the consistent secret
    console.log('Verifying token with secret:', process.env.JWT_SECRET ? 'Secret exists' : 'Using default secret');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || JWT_SECRET);

    // Add user from payload
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Token is valid but user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid', error: error.message });
  }
};

module.exports = auth; 