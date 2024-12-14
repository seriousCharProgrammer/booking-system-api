const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('express-async-handler');
// Middleware to protect routes by ensuring the user is authenticated
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  // Check if the Authorization header is present and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract the token from the Authorization header
    token = req.headers.authorization.split(' ')[1];
  }
  // If no token is found, return a 401 Unauthorized response
  if (!token) {
    return next(new ErrorResponse('not authorized to access this route', 401));
  }
  try {
    // Verify the token using the secret key from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the decoded user ID to the request object
    req.user = await User.findById(decoded.id);
    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // If token verification fails, return a 401 Unauthorized response
    return next(new ErrorResponse('not authorized to acces this route', 401));
  }
});
// Middleware to authorize access based on user roles
exports.authorize = (...roles) => {
  // Check if the user’s role is included in the roles array passed to the middleware
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // If the user’s role is not authorized, return a 403 Forbidden response
      next(new ErrorResponse(`access is not permitted`, 403));
    }
    next();
  };
};
