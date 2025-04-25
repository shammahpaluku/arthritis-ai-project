const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Authentication middleware (role-agnostic)
 */
const authenticate = () => {
  return async (req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Incoming headers:', req.headers);
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or malformed auth header');
      return res.status(401).json({ error: 'Authentication token missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (process.env.NODE_ENV === 'development') {
        console.log('Decoded token:', decoded);
      }

      // Attach basic user info (role removed)
      req.user = {
        id: decoded.id,
        username: decoded.username
      };

      next();
    } catch (error) {
      console.error('Authentication error:', error.message);

      let errorMessage = 'Invalid token';
      if (error.name === 'TokenExpiredError') {
        errorMessage = 'Token expired';
      } else if (error.name === 'JsonWebTokenError') {
        errorMessage = 'Malformed token';
      }

      res.status(401).json({ 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
          details: error.message
        })
      });
    }
  };
};

/**
 * Token generator (role excluded)
 */
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      id: user.id,
      username: user.username
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
};

module.exports = {
  authenticate,
  generateToken
};
