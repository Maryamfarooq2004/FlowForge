import mongoose from 'mongoose';
import { logger } from '../utils/logger.utils';

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');
  
  try {
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // BUG 1 FIX: these prevent NoSQL injection attacks
      sanitizeFilter: true,
    });
    logger.info('MongoDB Atlas connected successfully');
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Mongoose global settings — SECURITY CRITICAL (BUG 1 & 6 FIXES)
mongoose.set('sanitizeFilter', true);  // prevents NoSQL injection
mongoose.set('strict', true);          // only save defined schema fields
mongoose.set('strictQuery', true);     // strict query filtering

export default connectDB;
