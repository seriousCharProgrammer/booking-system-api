// Import necessary modules
const fs = require('fs');
const mongoose = require('mongoose');
const User = require('./models/UserModel');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: '.env' });

// Construct the database connection URI using environment variables
const dbURI = process.env.DATA_URI?.replace(
  '<PASSWORD>',
  process.env.DATA_PASS
);

if (!dbURI) {
  console.error(
    'Error: Database URI or password is missing. Please check your .env file.'
  );
  process.exit(1); // Exit with failure code
}

// Function to connect to the MongoDB database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(dbURI);
    console.log(
      `✅ Database connected successfully to ${conn.connection.host}`
    );
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1); // Exit with failure code
  }
};

// Connect to the database
connectDB();

// Read users data from the JSON file
const usersFilePath = `${__dirname}/_data/users.json`;

let users;
try {
  users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
} catch (error) {
  console.error(
    `❌ Error reading or parsing file at ${usersFilePath}:`,
    error.message
  );
  process.exit(1); // Exit with failure code
}

// Function to import users data into the database
const importUsers = async () => {
  try {
    await User.create(users);
    console.log('✅ Users data successfully imported to the database.');
    process.exit(0); // Exit with success code
  } catch (error) {
    console.error('❌ Error importing users data:', error.message);
    process.exit(1); // Exit with failure code
  }
};

// Function to delete all users data from the database
const deleteUsers = async () => {
  try {
    await User.deleteMany();
    console.log('✅ All users data successfully deleted from the database.');
    process.exit(0); // Exit with success code
  } catch (error) {
    console.error('❌ Error deleting users data:', error.message);
    process.exit(1); // Exit with failure code
  }
};

// Handle command-line arguments to determine operation
if (process.argv[2] === '-i') {
  console.log('ℹ️ Importing users data...');
  importUsers();
} else if (process.argv[2] === '-d') {
  console.log('ℹ️ Deleting all users data...');
  deleteUsers();
} else {
  console.log('❓ Invalid command. Use:');
  console.log('   -i to import users data');
  console.log('   -d to delete all users data');
  process.exit(1); // Exit with failure code
}
