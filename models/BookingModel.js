const mongoose = require('mongoose');
const ErrorResponse = require('../utils/errorResponse');

// Define the schema for the Booking model
const BookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId, // Reference to the User model
      ref: 'User',
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
// Pre-validation hook to check if the start time is before the end time
BookingSchema.pre('validate', function (next) {
  if (this.startTime >= this.endTime) {
    next(new ErrorResponse('Start time must be before end time'), 400);
  }
  next();
});
// Static method to check for booking conflicts
BookingSchema.statics.checkConflict = async function (
  date,
  startTime,
  endTime,
  excludeBookingId = null
) {
  const query = {
    date: new Date(date),
    $or: [
      // Case 1: New booking starts during an existing booking
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      },
      // Case 2: New booking completely encompasses an existing booking
      {
        startTime: { $gte: startTime },
        endTime: { $lte: endTime },
      },
      // Case 3: Existing booking encompasses the new booking
      {
        startTime: { $lte: startTime },
        endTime: { $gte: endTime },
      },
    ],
  };

  // Exclude the current booking if an ID is provided (useful for update operations)
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId }; // Exclude the current booking from the conflict check
  }

  const existingBookings = await this.find(query);
  return existingBookings.length > 0;
};

module.exports = mongoose.model('Booking', BookingSchema);
