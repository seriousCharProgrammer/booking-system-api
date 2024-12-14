const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();

// Route for user registration
// POST /api/v1/auth/register - Registers a new user
router.route('/register').post(register);

// Route for user login
// POST /api/v1/auth/login - Logs in an existing user
router.route('/login').post(login);

module.exports = router;
