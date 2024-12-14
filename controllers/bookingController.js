const { validateBooking } = require('../middlewares/validationMiddleware');
const Booking = require('../models/BookingModel');
const asyncHandler = require('express-async-handler');

// Function to create a new booking
exports.createBooking = asyncHandler(async (req, res, next) => {
  const { date, startTime, endTime } = req.body;
  // Validate booking data
  const { error } = validateBooking(req.body, { abortEarly: false });
  if (error) {
    return next(
      res.status(400).json({
        message: 'Validation Error',
        details: error.details.map((detail) => detail.message),
      })
    );
  }
  // Check if the time slot is already booked
  const hasConflict = await Booking.checkConflict(date, startTime, endTime);
  if (hasConflict) {
    return res.status(409).json({
      message: 'This time slot is already booked',
    });
  }
  // Create the booking if no conflict
  const booking = await Booking.create({
    userId: req.user._id,
    date,
    startTime,
    endTime,
  });
  // Send a successful response with booking details
  res.status(201).json({
    success: true,
    user: req.user.user,
    bookingID: booking._id,
    data: {
      booking,
    },
  });
});
// Function to get all bookings for a specific user
exports.getUserAllBookings = asyncHandler(async (req, res, next) => {
  const bookings = await Booking.find({ userId: req.user._id });
  // If no bookings found or bookings is empty, return a message
  if (!bookings || bookings.length === 0) {
    return res.status(200).json({
      message: 'No bookings available',
    });
  }
  // Return the list of bookings
  res.status(200).json({
    bookings,
  });
});

// Function to get all bookings in the system (Admin)
exports.getAllBookings = asyncHandler(async (req, res, next) => {
  const bookings = await Booking.find();
  // If no bookings found or bookings is empty, return a message
  if (!bookings || bookings.length === 0) {
    return res.status(200).json({
      message: 'No bookings available',
    });
  }
  // Return the list of all bookings
  res.status(200).json({
    success: true,
    bookings,
  });
});
// Function to get a single booking by its ID
exports.getOneBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  // If booking not found, return an error message
  if (!booking) {
    return res.status(200).json({
      message: `Booking with id:${req.params.id} dosen't exsist`,
    });
  }
  // Return the found booking
  res.status(200).json({
    success: true,
    booking,
  });
});
// Function to update an existing booking
exports.updateBooking = asyncHandler(async (req, res, next) => {
  // First, validate the booking data
  const { error } = validateBooking(req.body);

  // If validation fails, return error details
  if (error) {
    return res.status(400).json({
      message: 'Validation Error',
      details: error.details.map((detail) => detail.message),
    });
  }

  const { date, startTime, endTime } = req.body;

  // Check if the booking exists
  let booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({
      message: `Booking with id: ${req.params.id} doesn't exist`,
    });
  }

  // Check for time slot conflicts before updating  const hasConflict = await Booking.checkConflict(
  const hasConflict = await Booking.checkConflict(
    date,
    startTime,
    endTime,
    req.params.id
  );
  if (hasConflict) {
    return res.status(409).json({
      message: 'This time slot is already booke08d',
    });
  }

  // Update the booking and return the updated document
  booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Return the updated document
    runValidators: true, // Run mongoose validators
  });
  booking = await booking.save();
  booking = await Booking.findById(req.params.id);
  // Return the updated booking
  res.status(200).json({
    success: true,
    booking,
  });
});
// Function to delete a booking
exports.deleteBooking = asyncHandler(async (req, res, next) => {
  // Check if the booking exists
  let booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({
      message: `Booking with id: ${req.params.id} doesn't exist`,
    });
  }
  // Delete the booking
  product = await Booking.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: null,
  });
});
