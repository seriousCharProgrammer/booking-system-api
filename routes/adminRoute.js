const express = require('express');
const {
  getAllBookings,
  getOneBooking,
  updateBooking,
  createBooking,
  deleteBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const router = express.Router();

// Apply authentication and authorization middleware to all routes
// Only 'admin' role users are allowed to access the routes
router.use(protect, authorize('admin'));

//Route for getting all bookings and creating a new booking
// GET /api/v1/bookings - Fetch all bookings
// POST /api/v1/bookings - Create a new booking
router.route('/').get(getAllBookings).post(createBooking);

// Route for handling operations on a specific booking by its ID
// GET /api/v1/bookings/:id - Fetch a booking by ID
// PUT /api/v1/bookings/:id - Update a booking by ID
// DELETE /api/v1/bookings/:id - Delete a booking by ID
router
  .route('/:id')
  .get(getOneBooking)
  .put(updateBooking)
  .delete(deleteBooking);
module.exports = router;

/**
 * @swagger
 * tags:
 *   name: AdminBookings
 *   description: Admin management of bookings
 */

/**
 * @swagger
 * /api/v1/admin/:
 *   get:
 *     summary: Get all bookings for all users and exists in database
 *     tags: [AdminBookings]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve all bookings (Admin only).
 *     responses:
 *       200:
 *         description: Successfully retrieved all bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 bookings:
 *                   $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized access
 *   post:
 *     summary: Create a new booking
 *     tags: [AdminBookings]
 *     security:
 *       - bearerAuth: []
 *     description: Create a new booking (Admin only).
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
 *                 description: Booking date
 *               startTime:
 *                 type: string
 *                 description: Start time of the booking
 *                 pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$'
 *               endTime:
 *                 type: string
 *                 description: End time of the booking
 *                 pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$'
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
 *
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized access
 */

/**
 * @swagger
 * /api/v1/admin/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [AdminBookings]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve a booking by its ID (Admin only).
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Booking not found
 *       401:
 *         description: Unauthorized access
 *   put:
 *     summary: Update booking by ID
 *     tags: [AdminBookings]
 *     security:
 *       - bearerAuth: []
 *     description: Update an existing booking (Admin only).
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Booking ID
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
 *                 description: Booking date
 *               startTime:
 *                 type: string
 *                 description: Start time of the booking
 *                 pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$'
 *               endTime:
 *                 type: string
 *                 description: End time of the booking
 *                 pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$'
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
 *                   example: true
 *                 booking:
 *                    $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Booking not found
 *   delete:
 *     summary: Delete booking by ID
 *     tags: [AdminBookings]
 *     security:
 *       - bearerAuth: []
 *     description: Delete a booking by its ID (Admin only).
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Booking ID
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
 *                   example: true
 *                 data:
 *                   type: null
 *       404:
 *         description: Booking not found
 */
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
