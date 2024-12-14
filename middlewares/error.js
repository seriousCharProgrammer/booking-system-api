const ErrorResponse = require('../utils/errorResponse');
// Middleware to handle errors and send a structured response
const errorHandler = function (err, req, res, next) {
  let error = { ...err }; // Create a copy of the error object to avoid mutating the original error
  error.message = err.message; // Assign the error message to the custom error object
  // Handle "CastError" (e.g., when an invalid MongoDB ID is provided)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }
  // Handle MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    const message = `duplicate field entered already exists `;
    error = new ErrorResponse(message, 400);
  }
  // Handle validation errors (e.g., when data does not match schema)
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((el) => el.message);
    error = new ErrorResponse(message, 400);
  }
  // Send the final error response with the appropriate status and message
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'server error',
  });
};

module.exports = errorHandler;
