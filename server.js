const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectdb = require('./config/DB');
const errorHandler = require('./middlewares/error');
const authRoute = require('./routes/authRoute');
const adminRoute = require('./routes/adminRoute');
const bookingRoute = require('./routes/bookingRoute');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

// Load environment variables
dotenv.config({ path: './.env' });

// Determine the environment
const NODE_ENV = process.env.NODE_ENV || 'development';

const PORT = process.env.PORT || 4000;
const app = express();

// Middleware configuration based on environment
function configureMiddleware(app) {
  // Security middleware for production
  if (NODE_ENV === 'production') {
    app.use(helmet()); // Helps secure Express apps by setting various HTTP headers
  }

  // CORS configuration
  const corsOptions = {
    origin:
      NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS.split(',') : '*', // More restrictive in production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
  };
  app.use(cors(corsOptions));

  // Logging middleware
  if (NODE_ENV === 'development') {
    app.use(morgan('dev')); // Detailed logging in development
  } else if (NODE_ENV === 'production') {
    app.use(morgan('combined')); //  more production-friendly logging
  }

  // Prevent large payloads and Only accept arrays and objects
  app.use(
    express.json({
      limit: '20kb',
      strict: true,
    })
  );
  app.use(express.urlencoded({ extended: true, limit: '20kb' }));
}

// Swagger documentation setup
function setupSwagger(app) {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Booking System API',
        version: '1.0.0',
        description: 'API for managing bookings',
        contact: {
          name: 'API Support',
          email: process.env.SUPPORT_EMAIL || 'support@example.com',
        },
      },
      servers: [
        {
          url:
            NODE_ENV === 'production'
              ? process.env.PRODUCTION_URL
              : `http://localhost:${PORT}`,
        },
      ],
      security: [{ bearerAuth: [] }],
    },
    apis: ['./routes/*.js', './models/*.js'],
  };

  const swaggerSpec = swaggerJSDoc(swaggerOptions);

  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
}

// Database connection
function connectDatabase() {
  try {
    connectdb();
    console.log(`Database connected in ${NODE_ENV} mode`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

// Route configuration
function configureRoutes(app) {
  app.use('/api/v1/auth', authRoute);
  app.use('/api/v1/bookings', bookingRoute);
  app.use('/api/v1/admin', adminRoute);
}

// Server startup function
function startServer() {
  // Configure middleware
  configureMiddleware(app);

  // Setup Swagger documentation
  setupSwagger(app);

  // Connect to database
  connectDatabase();

  // Configure routes
  configureRoutes(app);

  // Error handling middleware (placed after all routes)
  app.use(errorHandler);

  // Create server
  const server = app.listen(PORT, () => {
    console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);

    // Graceful shutdown
    server.close(() => {
      console.log('Server shutting down due to unhandled rejection');
      process.exit(1);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);

    // Graceful shutdown
    server.close(() => {
      console.log('Server shutting down due to uncaught exception');
      process.exit(1);
    });
  });

  return server;
}

// Export for testing and startup
module.exports = {
  app,
  startServer,
};

// Start the server if not being imported
if (require.main === module) {
  startServer();
}
