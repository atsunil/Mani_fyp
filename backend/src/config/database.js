const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connection established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = { connectDB };
