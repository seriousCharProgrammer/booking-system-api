const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

// Construct the database connection URI using environment variables
const db = process.env.DATA_URI.replace('<PASSWORD>', process.env.DATA_PASS); // Replacing <PASSWORD> placeholder with the actual password

// Function to connect to the database
const connectdb = async function () {
  try {
    // Attempt to connect to MongoDB using the URI
    const conn = await mongoose.connect(db);
    console.log(`Database successfully connected to ${conn.connection.host}`); // Log success message with the host info
  } catch (error) {
    console.log(error); // Log any connection error
  }
};

// Export the connectdb function to be used in other parts of the app
module.exports = connectdb;
