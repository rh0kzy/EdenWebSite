// Authentication Routes
const express = require('express');
const router = express.Router();
const { login, logout, verify } = require('../controllers/authController');

// Login
router.post('/login', login);

// Logout
router.post('/logout', logout);

// Verify token
router.get('/verify', verify);

module.exports = router;
