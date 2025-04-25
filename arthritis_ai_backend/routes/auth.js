const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// ============================
// 📝 Register (No role)
// ============================
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if username already exists
    const userExists = await pool.query(
      'SELECT username FROM users WHERE username = $1',
      [username]
    );

    if (userExists.rows.length) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password and insert new user (no role)
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
      [username, hashedPassword]
    );

    // Generate JWT
    const token = jwt.sign(
      {
        id: newUser.rows[0].id,
        username: newUser.rows[0].username
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.rows[0].id,
        username: newUser.rows[0].username
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ============================
// 🔐 Login (No role in token)
// ============================
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await pool.query(
      'SELECT id, username, password FROM users WHERE username = $1',
      [username]
    );

    if (!user.rows.length || !(await bcrypt.compare(password, user.rows[0].password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token without role
    const token = jwt.sign(
      {
        id: user.rows[0].id,
        username: user.rows[0].username
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.rows[0].id,
        username: user.rows[0].username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============================
// 👤 Get Current User (/me)
// ============================
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      user: {
        id: decoded.id,
        username: decoded.username
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Optional: Test route
router.get('/login', (req, res) => {
  res.send('Auth route is working');
});

module.exports = router;
