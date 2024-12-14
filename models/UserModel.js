const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
// Define the User schema
const UserSchema = new mongoose.Schema({
  user: {
    type: String,
    required: [true, 'please add a name'],
  },
  email: {
    type: String,
    required: [true, 'please add an email'],
    unique: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'please add a valid email'],
  },
  password: {
    type: String,
    trim: true,
    required: [true, 'please add a password'],
    minlength: 4,
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// Pre-save hook to hash the password before saving the user to the database
UserSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
// Method to generate a JWT token after user login
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
// Method to compare entered password with the stored hashed password
UserSchema.methods.matchPassword = async function (entrPassword) {
  return await bcrypt.compare(entrPassword, this.password);
};
module.exports = mongoose.model('User', UserSchema);
/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - user
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the user
 *         user:
 *           type: string
 *           description: Name of the user
 *         email:
 *           type: string
 *           description: User's email address
 *         role:
 *           type: string
 *           description: User's role in the system
 *           enum: ['user', 'admin']
 *           default: 'user'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of user creation
 *
 *     UserRegistration:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the user
 *         email:
 *           type: string
 *           description: User's email address
 *         password:
 *           type: string
 *           description: User's password (min 4 characters)
 *
 *     UserLogin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: User's email address
 *         password:
 *           type: string
 *           description: User's password
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * paths:
 *   /api/v1/auth/register:
 *     post:
 *       summary: Register a new user
 *       tags:
 *         - Users
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserRegistration'
 *       responses:
 *         201:
 *           description: User registered successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/User'
 *         400:
 *           description: Invalid registration data
 *         409:
 *           description: Email already exists
 *
 *   /api/v1/auth/login:
 *     post:
 *       summary: User login
 *       tags:
 *         - Users
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserLogin'
 *       responses:
 *         200:
 *           description: Successfully logged in
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   token:
 *                     type: string
 *                     description: JWT token for authentication
 *         401:
 *           description: Invalid credentials
 *
 *
 */
