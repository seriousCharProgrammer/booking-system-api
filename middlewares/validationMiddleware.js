const Joi = require('joi');
// Joi schema for validating booking data
const validateBooking = (data) => {
  // Define the schema for booking validation
  const bookingSchema = Joi.object({
    // Validate the date field: must be a valid ISO 8601 date
    date: Joi.date().iso().required().messages({
      'date.base': 'Date must be a valid ISO 8601 date.',
      'any.required': 'Date is a required field.',
    }),
    startTime: Joi.string()
      // Validate the start time: must match HH:mm format (24-hour clock)
      .pattern(/^([01]?\d|2[0-3]):([0-5]\d)$/)
      .required()
      .messages({
        'string.pattern.base': 'Start time must be in HH:mm format.',
        'any.required': 'Start time is a required field.',
      }),
    endTime: Joi.string()
      // Validate the end time: must match HH:mm format (24-hour clock)
      .pattern(/^([01]?\d|2[0-3]):([0-5]\d)$/)
      .required()
      .messages({
        'string.pattern.base': 'End time must be in HH:mm format.',
        'any.required': 'End time is a required field.',
      }),
  }).custom((value, helpers) => {
    // Custom validation to ensure start time is earlier than end time
    const start = new Date(`${value.date}T${value.startTime}`); // Create start time Date object
    const end = new Date(`${value.date}T${value.endTime}`); // Create end time Date object
    if (start >= end) {
      return helpers.error('any.invalid', {
        message: 'Start time must be earlier than end time.',
      });
    }
    return value;
  }, 'Custom Time Validation');
  return bookingSchema.validate(data);
};
module.exports.validateBooking = validateBooking;
