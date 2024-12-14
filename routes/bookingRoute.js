const express = require('express');
const {
  createBooking,
  getUserAllBookings,
  getOneBooking,
  updateBooking,
  deleteBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @openapi
 * /api/v1/bookings:
 *   post:
 *     summary: Create a new booking by user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - startTime
 *               - endTime
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-06-15"
 *               startTime:
 *                 type: string
 *                 format: time
 *                 example: "10:00"
 *               endTime:
 *                 type: string
 *                 format: time
 *                 example: "11:30"
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 bookingID:
 *                   type: string
 *                 user:
 *                   type: object
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Validation Error
 *       409:
 *         description: Booking Time Conflict
 */
router
  .route('/')
  .post(protect, authorize('user'), createBooking)

  /**
   * @openapi
   * /api/v1/bookings:
   *   get:
   *     summary: Get current user's bookings
   *     tags: [Bookings]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved user's bookings
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 bookings:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Booking'
   *       404:
   *         description: No bookings found
   */
  .get(protect, authorize('user'), getUserAllBookings);

/**
 * @openapi
 * /api/v1/bookings/{id}:
 *   get:
 *     summary: Get a specific booking by ID from users bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved booking
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Booking not found
 */
router
  .route('/:id')
  .get(protect, authorize('user'), getOneBooking)

  /**
   * @openapi
   * /api/v1/bookings/{id}:
   *   put:
   *     summary: Update a specific booking
   *     tags: [Bookings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               date:
   *                 type: string
   *                 format: date
   *                 example: "2024-06-16"
   *               startTime:
   *                 type: string
   *                 format: time
   *                 example: "11:00"
   *               endTime:
   *                 type: string
   *                 format: time
   *                 example: "12:30"
   *     responses:
   *       200:
   *         description: Booking updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 booking:
   *                   $ref: '#/components/schemas/Booking'
   *       400:
   *         description: Validation Error
   *       404:
   *         description: Booking not found
   *       409:
   *         description: Time Slot Conflict
   */
  .put(protect, authorize('user'), updateBooking)

  /**
   * @openapi
   * /api/v1/bookings/{id}:
   *   delete:
   *     summary: Delete a specific booking
   *     tags: [Bookings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Booking deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: null
   *       404:
   *         description: Booking not found
   */
  .delete(protect, authorize('user'), deleteBooking);

/**
 * @openapi
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         startTime:
 *           type: string
 *           format: time
 *         endTime:
 *           type: string
 *           format: time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

module.exports = router;
