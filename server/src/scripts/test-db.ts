import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../models/User.model';
import { Project } from '../models/Project.model';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const testDatabase = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env');
    process.exit(1);
  }

  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('✅ Connected successfully!');

    // 1. Check User Model
    console.log('👤 Verifying User model...');
    const userCount = await User.countDocuments();
    console.log(`📊 Current user count: ${userCount}`);

    // 2. Check Project Model
    console.log('📁 Verifying Project model...');
    const projectCount = await Project.countDocuments();
    console.log(`📊 Current project count: ${projectCount}`);

    // 3. Test Indexing
    const indexes = await User.listIndexes();
    console.log('🔑 User Indexes:', indexes.map(i => i.name).join(', '));

    console.log('\n✨ Database Verification Complete: ALL SYSTEMS NOMINAL');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Database Verification Failed:', error);
    process.exit(1);
  }
};

testDatabase();
