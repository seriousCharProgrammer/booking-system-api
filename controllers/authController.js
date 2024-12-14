const User = require('../models/UserModel');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');

const dotenv = require('dotenv');
dotenv.config({ path: '../.env' }); // Loading environment variables from the .env file

// Register user function
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Create a new user and save it to the database
  const user = await User.create({
    user: name, // Assign the name to 'user' field in the User model
    email,
    password,
    role,
  });

  // Send a response with a token after successful registration
  sendTokenResponse(user, 201, res);
});

// Login user function
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate that both email and password are provided
  if (!email || !password) {
    return next(
      new ErrorResponse('Please provide both an email and password', 400)
    );
  }

  // Find the user by email and include the password in the query result
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(
      new ErrorResponse('Wrong email or password, please retry', 401)
    );
  }

  // Compare the provided password with the stored hashed password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(
      new ErrorResponse('Wrong email or password, please retry', 401)
    );
  }

  // Send a response with a token after successful login
  sendTokenResponse(user, 200, res);
});

// Helper function to send the JWT token as a response
const sendTokenResponse = (user, statusCode, res) => {
  // Generate a JWT token for the user
  const token = user.getSignedJwtToken();

  // Cookie options (httpOnly for security, expires in 1 hour)
  const options = {
    expires: new Date(Date.now() + 60 * 60 * 1000), // Set cookie expiration time to 1 hour
    httpOnly: true, // Ensure the cookie is not accessible via JavaScript (for security)
  };

  // Send the token as a cookie and also as a response JSON
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token, // Return the token in the response body
  });
};
