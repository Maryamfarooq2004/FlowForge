import mongoose from 'mongoose';
import dns from 'dns';

// Fix for Atlas DNS resolution issues in some environments
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('FATAL: MONGODB_URI environment variable is not set.');
  process.exit(1);
}

const mongooseOptions: mongoose.ConnectOptions = {
  // Connection pool — keep alive across Railway restarts
  maxPoolSize: 10,
  minPoolSize: 2,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
  heartbeatFrequencyMS: 10000,
  
  // Keeps connection alive through Railway idle periods
  family: 4,
};

export const connectDatabase = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', true);
    
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log('MongoDB Atlas connected successfully.');
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully.');
    });

  } catch (error) {
    console.error('MongoDB initial connection failed:', error);
    process.exit(1);
  }
};
