import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../models/User.model';
import { Project } from '../models/Project.model';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not found');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB for seeding...');

    // Clear existing data (Optional: remove if you want to keep current data)
    await User.deleteMany({});
    await Project.deleteMany({});
    console.log('🧹 Cleared old data');

    // 1. Create Admin User
    const admin = await User.create({
      fullName: 'FlowForge Admin',
      email: 'admin@flowforge.com',
      password: 'Password123!',
      organizationType: 'clinic',
      role: 'admin',
      isEmailVerified: true,
      businessName: 'FlowForge HQ',
    });
    console.log('👤 Admin user created');

    // 2. Create Regular Clinic User
    const user = await User.create({
      fullName: 'Dr. Maryam Farooq',
      email: 'maryam@alshifaclinic.com',
      password: 'Password123!',
      organizationType: 'clinic',
      isEmailVerified: true,
      businessName: 'Al-Shifa Medical Center',
    });
    console.log('👤 Clinic user created');

    // 3. Create Projects for the Clinic User
    const projects = [
      {
        userId: user._id,
        name: 'Patient Intake Redesign',
        organizationName: 'Al-Shifa Medical Center',
        category: 'clinic',
        status: 'live',
        liveUrl: 'https://alshifa-intake.flowforge.app',
      },
      {
        userId: user._id,
        name: 'Laboratory Results Workflow',
        organizationName: 'Al-Shifa Medical Center',
        category: 'clinic',
        status: 'spec_ready',
      },
      {
        userId: user._id,
        name: 'Emergency Response System',
        organizationName: 'Al-Shifa Medical Center',
        category: 'clinic',
        status: 'preview',
        stagingUrl: 'https://staging-alshifa-er.flowforge.app',
      },
      {
        userId: user._id,
        name: 'Legacy Appointment Logs',
        organizationName: 'Al-Shifa Medical Center',
        category: 'clinic',
        status: 'archived',
        isArchived: true,
      },
    ];

    await Project.insertMany(projects);
    console.log(`📂 ${projects.length} projects created for clinic user`);

    // 4. Create a School User
    const schoolUser = await User.create({
      fullName: 'Principal Ahmed',
      email: 'ahmed@cityschool.edu',
      password: 'Password123!',
      organizationType: 'school',
      isEmailVerified: true,
      businessName: 'City International School',
    });

    await Project.create({
      userId: schoolUser._id,
      name: 'Student Enrollment 2026',
      organizationName: 'City International School',
      category: 'school',
      status: 'intake',
    });
    console.log('👤 School user and project created');

    console.log('\n🚀 SEEDING COMPLETE!');
    console.log('-----------------------------------');
    console.log('Login with:');
    console.log('Email: maryam@alshifaclinic.com');
    console.log('Password: Password123!');
    console.log('-----------------------------------');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
