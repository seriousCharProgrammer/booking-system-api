const { register, login } = require('../controllers/authController');
const User = require('../models/UserModel');
const httpMocks = require('node-mocks-http');
const ErrorResponse = require('../utils/errorResponse');

// Mock dependencies
jest.mock('../models/UserModel');
jest.mock('../utils/errorResponse');
jest.mock('express-async-handler', () => (fn) => fn);

describe('Auth Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = httpMocks.createRequest();
    mockRes = httpMocks.createResponse();
    mockNext = jest.fn();

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockReq.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
      };

      const mockUser = {
        _id: 'user123',
        user: 'Test User',
        email: 'test@example.com',
        getSignedJwtToken: jest.fn().mockReturnValue('mockToken'),
      };

      User.create = jest.fn().mockResolvedValue(mockUser);

      await register(mockReq, mockRes, mockNext);

      expect(User.create).toHaveBeenCalledWith({
        user: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
      });
      expect(mockRes.statusCode).toBe(201);
      const data = JSON.parse(mockRes._getData());
      expect(data.success).toBe(true);
      expect(data.token).toBe('mockToken');
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Create a mock user
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        password: 'hashedpassword',
        matchPassword: jest.fn().mockResolvedValue(true),
        getSignedJwtToken: jest.fn().mockReturnValue('mockToken'),
      };

      // Mock the findOne method to return an object with a select method
      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await login(mockReq, mockRes, mockNext);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockRes.statusCode).toBe(200);
      const data = JSON.parse(mockRes._getData());
      expect(data.success).toBe(true);
      expect(data.token).toBe('mockToken');
    });

    it('should return error if email or password is missing', async () => {
      mockReq.body = {
        email: 'test@example.com',
      };

      // Prepare ErrorResponse mock
      ErrorResponse.mockImplementation((message, statusCode) => ({
        message,
        statusCode,
      }));

      await login(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Please provide both an email and password',
          statusCode: 400,
        })
      );
    });

    it('should return error for non-existent user', async () => {
      mockReq.body = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      // Mock findOne to return null with a select method
      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      // Prepare ErrorResponse mock
      ErrorResponse.mockImplementation((message, statusCode) => ({
        message,
        statusCode,
      }));

      await login(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Wrong email or password, please retry',
          statusCode: 401,
        })
      );
    });

    it('should return error for incorrect password', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        password: 'hashedpassword',
        matchPassword: jest.fn().mockResolvedValue(false),
        getSignedJwtToken: jest.fn().mockReturnValue('mockToken'),
      };

      // Mock findOne to return an object with a select method
      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      // Prepare ErrorResponse mock
      ErrorResponse.mockImplementation((message, statusCode) => ({
        message,
        statusCode,
      }));

      await login(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Wrong email or password, please retry',
          statusCode: 401,
        })
      );
    });
  });
});
