const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    const maxRetries = 5;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const conn = await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });

            logger.info(`MongoDB Atlas connected: ${conn.connection.host}`);
            return;
        } catch (error) {
            attempt++;
            logger.error(`MongoDB connection attempt ${attempt} failed: ${error.message}`);

            if (attempt >= maxRetries) {
                logger.error('Max retries reached. Exiting process.');
                process.exit(1);
            }

            // Wait 3 seconds before retrying
            await new Promise((res) => setTimeout(res, 3000));
        }
    }
};

// Graceful disconnect on app shutdown
const disconnectDB = async () => {
    try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed gracefully.');
    } catch (error) {
        logger.error(`Error closing MongoDB connection: ${error.message}`);
    }
};

module.exports = { connectDB, disconnectDB };