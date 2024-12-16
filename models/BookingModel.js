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

BookingSchema.pre('validate', function (next) {
  // Get current date and time
  const now = new Date();

  // Parse the booking date
  const bookingDate = new Date(this.date);

  // Parse start and end times
  const [startHours, startMinutes] = this.startTime.split(':').map(Number);
  const [endHours, endMinutes] = this.endTime.split(':').map(Number);

  // Create date objects with the booking date and times
  const startDateTime = new Date(this.date);
  startDateTime.setHours(startHours, startMinutes, 0, 0);

  const endDateTime = new Date(this.date);
  endDateTime.setHours(endHours, endMinutes, 0, 0);

  // Validate start time is before end time
  if (startDateTime >= endDateTime) {
    return next(new Error('Start time must be before end time'));
  }

  // Check if booking date is in the past
  const nowWithoutTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const bookingDateWithoutTime = new Date(
    bookingDate.getFullYear(),
    bookingDate.getMonth(),
    bookingDate.getDate()
  );

  if (bookingDateWithoutTime < nowWithoutTime) {
    return next(new Error('Please choose a date not in the past'));
  }

  // If booking is for today, ensure start time is after current time
  if (bookingDateWithoutTime.getTime() === nowWithoutTime.getTime()) {
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const bookingStartTime = startHours * 60 + startMinutes;

    if (bookingStartTime <= currentTime) {
      return next(new Error('Booking time must be after the current time'));
    }
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
