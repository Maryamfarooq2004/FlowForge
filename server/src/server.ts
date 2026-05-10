import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import connectDB from './config/database';
import { logger } from './utils/logger.utils';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Start Listening
    app.listen(PORT, () => {
      logger.info(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(`${err.name}: ${err.message}`);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(`${err.name}: ${err.message}`);
  process.exit(1);
});

startServer();
