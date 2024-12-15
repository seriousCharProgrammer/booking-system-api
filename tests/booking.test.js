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
const { validateBooking } = require('../middlewares/validationMiddleware');

// Mock dependencies
jest.mock('../models/BookingModel');
jest.mock('../middlewares/validationMiddleware');
jest.mock('express-async-handler', () => (fn) => fn);

describe('Booking Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = httpMocks.createRequest();
    mockRes = httpMocks.createResponse();
    mockNext = jest.fn();

    // Reset all mocks before each test
    jest.clearAllMocks();
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

      // Mock validation to pass
      validateBooking.mockReturnValue({ error: null });

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

      // Mock validation to pass
      validateBooking.mockReturnValue({ error: null });

      // Mock a booking conflict
      Booking.checkConflict = jest.fn().mockResolvedValue(true);

      await createBooking(mockReq, mockRes, mockNext);
      expect(mockRes.statusCode).toBe(409);
      const data = JSON.parse(mockRes._getData());
      expect(data.message).toBe('This time slot is already booked');
    });

    it('should return validation error when booking data is invalid', async () => {
      mockReq.body = {
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '11:00',
      };
      mockReq.user = { _id: 'user123', user: 'testuser' };

      // Mock validation to fail
      validateBooking.mockReturnValue({
        error: {
          details: [{ message: 'Invalid date format' }],
        },
      });

      await createBooking(mockReq, mockRes, mockNext);
      expect(mockRes.statusCode).toBe(400);
      const data = JSON.parse(mockRes._getData());
      expect(data.message).toBe('Validation Error');
      expect(data.details).toEqual(
        expect.arrayContaining(['Invalid date format'])
      );
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

  describe('getAllBookings', () => {
    it('should return all bookings for admin', async () => {
      const mockBookings = [
        { _id: 'booking1', date: '2024-01-15' },
        { _id: 'booking2', date: '2024-01-16' },
      ];
      Booking.find = jest.fn().mockResolvedValue(mockBookings);

      await getAllBookings(mockReq, mockRes, mockNext);
      expect(mockRes.statusCode).toBe(200);
      const data = JSON.parse(mockRes._getData());
      expect(data.success).toBe(true);
      expect(data.bookings).toEqual(mockBookings);
    });

    it('should return message when no bookings exist', async () => {
      Booking.find = jest.fn().mockResolvedValue([]);

      await getAllBookings(mockReq, mockRes, mockNext);
      expect(mockRes.statusCode).toBe(200);
      const data = JSON.parse(mockRes._getData());
      expect(data.message).toBe('No bookings available');
    });
  });

  describe('getOneBooking', () => {
    it('should return a single booking', async () => {
      mockReq.params = { id: 'booking123' };
      const mockBooking = {
        _id: 'booking123',
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '11:00',
      };
      Booking.findById = jest.fn().mockResolvedValue(mockBooking);

      await getOneBooking(mockReq, mockRes, mockNext);
      expect(mockRes.statusCode).toBe(200);
      const data = JSON.parse(mockRes._getData());
      expect(data.success).toBe(true);
      expect(data.booking).toEqual(mockBooking);
    });

    it('should return not found for non-existent booking', async () => {
      mockReq.params = { id: 'invalidbooking' };
      Booking.findById = jest.fn().mockResolvedValue(null);

      await getOneBooking(mockReq, mockRes, mockNext);
      expect(mockRes.statusCode).toBe(200);
      const data = JSON.parse(mockRes._getData());
      expect(data.message).toContain(
        `Booking with id:${mockReq.params.id} dosen't exsist`
      );
    });
  });

  describe('updateBooking', () => {
    it('should update a booking successfully', async () => {
      mockReq.params = { id: 'booking123' };
      mockReq.body = {
        date: '2024-01-16',
        startTime: '11:00',
        endTime: '12:00',
      };

      // Mock existing booking
      const existingBooking = {
        _id: 'booking123',
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '11:00',
      };
      Booking.findById = jest.fn().mockResolvedValue(existingBooking);

      // Mock validation to pass
      validateBooking.mockReturnValue({ error: null });

      // Mock no conflict
      Booking.checkConflict = jest.fn().mockResolvedValue(false);

      // Mock update
      const updatedBooking = {
        ...existingBooking,
        date: '2024-01-16',
        startTime: '11:00',
        endTime: '12:00',
      };
      Booking.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedBooking);

      await updateBooking(mockReq, mockRes, mockNext);
      expect(mockRes.statusCode).toBe(200);
      const data = JSON.parse(mockRes._getData());
      expect(data.success).toBe(true);
      expect(data.booking).toEqual(updatedBooking);
    });

    it('should return not found for non-existent booking', async () => {
      mockReq.params = { id: 'invalidbooking' };
      mockReq.body = {
        date: '2024-01-16',
        startTime: '11:00',
        endTime: '12:00',
      };

      Booking.findById = jest.fn().mockResolvedValue(null);

      await updateBooking(mockReq, mockRes, mockNext);
      expect(mockRes.statusCode).toBe(404);
      const data = JSON.parse(mockRes._getData());
      expect(data.message).toContain("doesn't exist");
    });

    it('should return conflict error for booked time slot', async () => {
      mockReq.params = { id: 'booking123' };
      mockReq.body = {
        date: '2024-01-16',
        startTime: '11:00',
        endTime: '12:00',
      };

      // Mock existing booking
      const existingBooking = {
        _id: 'booking123',
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '11:00',
      };
      Booking.findById = jest.fn().mockResolvedValue(existingBooking);

      // Mock validation to pass
      validateBooking.mockReturnValue({ error: null });

      // Mock conflict
      Booking.checkConflict = jest.fn().mockResolvedValue(true);

      await updateBooking(mockReq, mockRes, mockNext);
      expect(mockRes.statusCode).toBe(409);
      const data = JSON.parse(mockRes._getData());
      expect(data.message).toBe('This time slot is already booked');
    });

    it('should return validation error', async () => {
      mockReq.params = { id: 'booking123' };
      mockReq.body = {
        date: '2024-01-16',
        startTime: '11:00',
        endTime: '12:00',
      };

      // Mock existing booking
      const existingBooking = {
        _id: 'booking123',
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '11:00',
      };
      Booking.findById = jest.fn().mockResolvedValue(existingBooking);

      // Mock validation to fail
      validateBooking.mockReturnValue({
        error: {
          details: [{ message: 'Invalid time format' }],
        },
      });

      await updateBooking(mockReq, mockRes, mockNext);
      expect(mockRes.statusCode).toBe(400);
      const data = JSON.parse(mockRes._getData());
      expect(data.message).toBe('Validation Error');
      expect(data.details).toEqual(
        expect.arrayContaining(['Invalid time format'])
      );
    });
  });

  describe('deleteBooking', () => {
    it('should delete a booking successfully', async () => {
      mockReq.params = { id: 'booking123' };

      // Mock existing booking
      const existingBooking = {
        _id: 'booking123',
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '11:00',
      };
      Booking.findById = jest.fn().mockResolvedValue(existingBooking);

      // Mock delete
      Booking.findByIdAndDelete = jest.fn().mockResolvedValue(existingBooking);

      await deleteBooking(mockReq, mockRes, mockNext);
      expect(mockRes.statusCode).toBe(200);
      const data = JSON.parse(mockRes._getData());
      expect(data.success).toBe(true);
      expect(data.data).toBe(null);
    });

    it('should return not found for non-existent booking', async () => {
      mockReq.params = { id: 'invalidbooking' };
      Booking.findById = jest.fn().mockResolvedValue(null);

      await deleteBooking(mockReq, mockRes, mockNext);
      expect(mockRes.statusCode).toBe(404);
      const data = JSON.parse(mockRes._getData());
      expect(data.message).toContain("doesn't exist");
    });
  });
});
