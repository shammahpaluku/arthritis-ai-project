// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const fs = require('fs');
const sharp = require('sharp');
const tf = require('@tensorflow/tfjs-node');

const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const { authenticate } = require('./middleware/authenticate');
const { pool } = require('./db');
const logger = require('./utils/logger');

const app = express();

// ======================
// Security Middleware
// ======================
app.use(helmet());

// ======================
// CORS Middleware
// ======================
const allowedOrigins = process.env.FRONTEND_URL?.split(',') || ['http://localhost:3000'];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  }
  next();
});

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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.options('*', cors());

// ======================
// Rate Limiting
// ======================
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
app.use('/models', express.static(path.join(__dirname, 'public/models')));

// ======================
// Health Check Endpoint
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
// Image Upload Middleware
// ======================
const upload = multer({ dest: 'uploads/' });

// ======================
// Analysis Routes
// ======================
app.post('/api/analysis', upload.single('image'), async (req, res) => {
  try {
    const { patientName, patientAge, patientGender } = req.body;
    const imageFile = req.file;

    // Stub for processing
    const analysis = {
      id: Date.now(),
      details: "Analysis logic not yet implemented."
    };

    res.json({
      analysisId: analysis.id,
      message: 'Analysis submitted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ======================
// New JS-Based Prediction Endpoint
// ======================
app.post('/api/predict', upload.single('xray'), async (req, res) => {
  try {
    const model = await tf.loadLayersModel('file://./public/models/model.json');

    const imageBuffer = await sharp(req.file.path)
      .resize(224, 224)
      .removeAlpha()
      .toFormat('png')
      .toBuffer();

    const tensor = tf.node.decodeImage(imageBuffer)
      .expandDims(0)
      .div(255.0);

    const prediction = model.predict(tensor);
    const predictionArray = prediction.arraySync()[0];

    const metadata = JSON.parse(fs.readFileSync('./public/models/model_metadata.json'));
    const labels = metadata.class_labels;
    const highestIndex = predictionArray.indexOf(Math.max(...predictionArray));

    res.json({
      class: labels[highestIndex],
      confidence: predictionArray[highestIndex],
      all_probabilities: labels.map((label, i) => ({
        class: label,
        confidence: predictionArray[i]
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Prediction failed.' });
  }
});

// ======================
// Routes
// ======================
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);

// Protected test endpoint
app.get('/protected', authenticate, (req, res) => {
  res.json({
    message: `Authenticated as ${req.user.username}`,
    user: {
      id: req.user.id,
      role: req.user.role,
      ...(req.user.permissions && { permissions: req.user.permissions })
    }
  });
});

// ======================
// Root Documentation
// ======================
app.get('/', (req, res) => {
  res.json({
    message: "Medical Imaging API",
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register'
      },
      api: {
        upload: 'POST /api/upload',
        results: 'GET /api/results',
        analysis: 'POST /api/analyze/:imageId',
        predict: 'POST /api/predict'
      },
      system: {
        health: 'GET /health',
        docs: 'GET /docs'
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
// Server Startup
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

// Graceful shutdown on unhandled rejection
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.stack}`);
  server.close(() => process.exit(1));
});

module.exports = server;
