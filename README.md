# Booking System API

## Project Description

This is a Node.js-based booking system API that allows users and admin to create, retrieve, update, delete and manage time slot bookings with robust validation and conflict prevention.

## Features

- seeder to seed the users database
- Create user
- Login user
- Create new bookings
- Retrieve all bookings made by the user
- Retrieve a specific booking by ID
- Update an exsisting booking by ID
- Delete booking by ID
- ALL CRUD function also implemented for Admin (retrieve all booking that exsists in the database)
- Prevent overlapping time slot bookings
- Comprehensive input validation
- API documentation with Swagger

## Prerequisites

- Node.js (v16.0.0 or later)
- npm (v8.0.0 or later)
- Git

## Technology Stack

- Backend Framework: Express.js
- Validation: Joi/mongoose
- Documentation: Swagger
- Testing: Jest
- Database: MongoDB Atlas

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/seriousCharProgrammer/booking-system-api.git
cd booking-system-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the project root with the following variables:

```
PORT=3500
DATA_URI=your_mongodb_connection_string_if_using_mongodb
DATA_PASS=your password for mongodb
JWT_SECRET=your_jwt_secret_for_authentication
JWT_EXPIRE=time for your token to expire
ALLOWED_ORIGINS=*
SUPPORT_EMAIL=chelsea@support.com
PRODUCTION_URL=http://localhost:3500
```

### 4. Run the Application

```bash
# Development mode
npm run dev

# Production mode
npm run start

# seed User Database
npm run seedusers

#delete User Database
npm run deleteusers
```

### 5. API Documentation

Access Swagger UI at: `http://localhost:3500/api-docs` at local machines

## Running Tests

```bash
npm run test
```

## API Endpoints

## API Access from endpoint /api/v1/

- **EXAMPLE:** `/api/v1/auth/register`

### Create Booking

- **Method:** POST
- **Endpoint:** `/bookings`
- **Request Body:**

```json
{
  "user": "charles hamilton",
  "date": "2024-01-15",
  "startTime": "14:00",
  "endTime": "15:00"
}
```

### Get All Bookings

- **Method:** GET
- **Endpoint:** `/bookings`

### Get Booking by ID

- **Method:** GET
- **Endpoint:** `/bookings/:id`

### Delete Booking

- **Method:** DELETE
- **Endpoint:** `/bookings/:id`

### Update Booking

- **Method:** PUT
- **Endpoint:** `/bookings/:id`

### The endpoint for admin is /admin/ or /admin/:id all CRUD func also applied for admin

### The Auth Endpoints (register and login)

- **Method:** POST
- **Endpoint:** `/auth/register`

- **Method:** POST
- **Endpoint:** `/auth/login`

## Error Handling

- 400: Bad Request (Validation Errors)
- 404: Resource Not Found
- 409: Booking Conflict

## Contact

seriousCharProgrammer

vercel-site-check-api: [https://keymapi.vercel.app/]

aws-Ec2-site-check-api: [http://52.59.239.179:3500/api-docs/]

Project Link: [https://github.com/seriousCharProgrammer/booking-system-api]
