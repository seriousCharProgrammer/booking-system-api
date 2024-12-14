const {
  createBooking,
  getUserAllBookings,
  getAllBookings,
  getOneBooking,
  updateBooking,
  deleteBooking,
} = require('../controllers/bookingController');
const Booking = require('../models/BookingModel');
const httpMocks = require('node-mocks-http');

// Mock dependencies
// Mock the BookingModel to avoid real database calls
jest.mock('../models/BookingModel');
jest.mock('express-async-handler', () => (fn) => fn);

describe('Booking Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = httpMocks.createRequest();
    mockRes = httpMocks.createResponse();
    mockNext = jest.fn();
  });

  describe('createBooking', () => {
    it('should create a new booking successfully', async () => {
      // Setup mock data
      mockReq.body = {
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '11:00',
      };
      mockReq.user = { _id: 'user123', user: 'testuser' };

      // Mock Booking.checkConflict and Booking.create
      Booking.checkConflict = jest.fn().mockResolvedValue(false);
      Booking.create = jest.fn().mockResolvedValue({
        _id: 'booking123',
        userId: 'user123',
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '11:00',
      });

      await createBooking(mockReq, mockRes, mockNext);

      // Assertions
      expect(Booking.checkConflict).toHaveBeenCalledWith(
        '2024-01-15',
        '10:00',
        '11:00'
      );
      expect(Booking.create).toHaveBeenCalled();
      expect(mockRes.statusCode).toBe(201);
      const data = JSON.parse(mockRes._getData());
      expect(data.success).toBe(true);
      expect(data.bookingID).toBe('booking123');
    });

    it('should return conflict error if time slot is already booked', async () => {
      mockReq.body = {
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '11:00',
      };
      mockReq.user = { _id: 'user123', user: 'testuser' };

      // Mock a booking conflict
      Booking.checkConflict = jest.fn().mockResolvedValue(true);

      await createBooking(mockReq, mockRes, mockNext);

      expect(mockRes.statusCode).toBe(409);
      const data = JSON.parse(mockRes._getData());
      expect(data.message).toBe('This time slot is already booked');
    });
  });

  describe('getUserAllBookings', () => {
    it('should return user bookings', async () => {
      mockReq.user = { _id: 'user123' };
      const mockBookings = [
        { _id: 'booking1', date: '2024-01-15' },
        { _id: 'booking2', date: '2024-01-16' },
      ];

      Booking.find = jest.fn().mockResolvedValue(mockBookings);

      await getUserAllBookings(mockReq, mockRes, mockNext);

      expect(mockRes.statusCode).toBe(200);
      const data = JSON.parse(mockRes._getData());
      expect(data.bookings).toEqual(mockBookings);
    });

    it('should return message when no bookings exist', async () => {
      mockReq.user = { _id: 'user123' };
      Booking.find = jest.fn().mockResolvedValue([]);

      await getUserAllBookings(mockReq, mockRes, mockNext);

      expect(mockRes.statusCode).toBe(200);
      const data = JSON.parse(mockRes._getData());
      expect(data.message).toBe('No bookings available');
    });
  });
});
