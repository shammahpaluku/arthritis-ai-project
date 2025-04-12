require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const { authenticate } = require('./middleware/authenticate');
const { pool } = require('./db'); // Direct pool import for health check
const logger = require('./utils/logger'); // Recommended addition

const app = express();

// Root Route
app.get('/', (req, res) => {
  res.send(`
    <h1>Medical Image Analysis API</h1>
    <p>Endpoints:</p>
    <ul>
      <li><b>GET /api/results</b> - List all analyses</li>
      <li><b>POST /api/upload</b> - Upload an image</li>
      <li><b>POST /auth/login</b> - User login</li>
    </ul>
  `);
});

// ======================
// Security Middleware
// ======================
app.use(helmet());

// ======================
// CORS Middleware
// ======================
const allowedOrigins = process.env.FRONTEND_URL?.split(',') || ['http://localhost:3000'];

// CORS custom headers middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  next();
});

// CORS middleware to handle preflight requests
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enable preflight for all routes
app.options('*', cors());

// Rate limiting (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// ======================
// Core Middleware
// ======================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ======================
// Database Health Check
// ======================
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

// ======================
// Route Registration
// ======================
app.use('/api', apiRoutes);

// Add auth routes under /api/auth
app.use('/api/auth', authRoutes); // This creates /api/auth/login endpoint

// Protected test endpoint
app.get('/protected', authenticate, (req, res) => {
  res.json({ 
    message: `Authenticated as ${req.user.username}`,
    user: {
      id: req.user.id,
      role: req.user.role,
      permissions: req.user.permissions
    }
  });
});

// ======================
// Documentation Route
// ======================
app.get('/', (req, res) => {
  res.json({
    message: "Medical Imaging API",
    endpoints: {
      auth: {
        login: 'POST /api/auth/login', // Updated route
        register: 'POST /api/auth/register' // Added register route
      },
      api: {
        upload: 'POST /api/upload',
        results: 'GET /api/results',
        analysis: 'POST /api/analyze/:imageId'
      },
      system: {
        health: 'GET /health',
        docs: 'GET /docs' // Consider adding Swagger later
      }
    }
  });
});

// ======================
// Error Handling
// ======================
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : err.message;
  
  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.details
    })
  });
});

// ======================
// Server Initialization
// ======================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
  Server running in ${process.env.NODE_ENV || 'development'} mode
  Listening on port ${PORT}
  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}
  Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
  `);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.stack}`);
  server.close(() => process.exit(1));
});

module.exports = server; // For testing
