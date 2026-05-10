import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../models/User.model';
// We'll create a simple Project model if it doesn't exist yet or use collection directly
import { ObjectId } from 'mongodb';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function seedDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI is not defined in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');

    const hashedPassword = await bcrypt.hash('Test@1234', 12);

    const seedUsers = [
      {
        _id: new ObjectId('6b001111111111111111aaaa'),
        fullName: 'Dr. Hassan Khalid',
        email: 'hassan@cityhealthclinic.com',
        password: hashedPassword,
        organizationType: 'clinic',
        businessName: 'City Health Clinic',
        logoUrl: null,
        role: 'user',
        isEmailVerified: true,
        loginAttempts: 0,
        refreshTokens: [],
        lastLoginAt: new Date('2026-05-08T09:30:00Z'),
        createdAt: new Date('2026-02-14T08:00:00Z'),
        updatedAt: new Date('2026-05-08T09:30:00Z'),
      },
      {
        _id: new ObjectId('6b002222222222222222bbbb'),
        fullName: 'Dr. Ayesha Siddiqui',
        email: 'ayesha@medipluslahore.com',
        password: hashedPassword,
        organizationType: 'clinic',
        businessName: 'MediPlus Lahore',
        logoUrl: null,
        role: 'user',
        isEmailVerified: true,
        loginAttempts: 0,
        refreshTokens: [],
        lastLoginAt: new Date('2026-05-09T11:00:00Z'),
        createdAt: new Date('2026-03-01T10:00:00Z'),
        updatedAt: new Date('2026-05-09T11:00:00Z'),
      },
      {
        _id: new ObjectId('6b003333333333333333cccc'),
        fullName: 'Imran Qureshi',
        email: 'imran@beaconinstitute.edu.pk',
        password: hashedPassword,
        organizationType: 'school',
        businessName: 'Beacon Institute',
        logoUrl: null,
        role: 'user',
        isEmailVerified: true,
        loginAttempts: 0,
        refreshTokens: [],
        lastLoginAt: new Date('2026-05-07T14:00:00Z'),
        createdAt: new Date('2026-01-20T09:00:00Z'),
        updatedAt: new Date('2026-05-07T14:00:00Z'),
      },
      {
        _id: new ObjectId('6b004444444444444444dddd'),
        fullName: 'Sana Malik',
        email: 'sana@brightmindsacademy.edu.pk',
        password: hashedPassword,
        organizationType: 'school',
        businessName: 'Bright Minds Academy',
        logoUrl: null,
        role: 'user',
        isEmailVerified: true,
        loginAttempts: 0,
        refreshTokens: [],
        lastLoginAt: new Date('2026-05-10T08:00:00Z'),
        createdAt: new Date('2026-02-05T11:00:00Z'),
        updatedAt: new Date('2026-05-10T08:00:00Z'),
      },
      {
        _id: new ObjectId('6b005555555555555555eeee'),
        fullName: 'Dr. Tariq Mehmood',
        email: 'tariq@shifaclinic.com',
        password: hashedPassword,
        organizationType: 'clinic',
        businessName: 'Shifa Family Clinic',
        logoUrl: null,
        role: 'user',
        isEmailVerified: true,
        loginAttempts: 0,
        refreshTokens: [],
        lastLoginAt: new Date('2026-05-06T16:00:00Z'),
        createdAt: new Date('2026-03-10T13:00:00Z'),
        updatedAt: new Date('2026-05-06T16:00:00Z'),
      },
      {
        _id: new ObjectId('6b006666666666666666ffff'),
        fullName: 'Rabia Noor',
        email: 'rabia@futureschools.edu.pk',
        password: hashedPassword,
        organizationType: 'school',
        businessName: 'Future Schools Network',
        logoUrl: null,
        role: 'user',
        isEmailVerified: true,
        loginAttempts: 0,
        refreshTokens: [],
        lastLoginAt: new Date('2026-05-09T15:30:00Z'),
        createdAt: new Date('2026-01-10T10:00:00Z'),
        updatedAt: new Date('2026-05-09T15:30:00Z'),
      },
      {
        _id: new ObjectId('6b007777777777777777gggg'),
        fullName: 'Usman Farhan',
        email: 'usman@newuser.com',
        password: hashedPassword,
        organizationType: 'clinic',
        businessName: '',
        logoUrl: null,
        role: 'user',
        isEmailVerified: true,
        loginAttempts: 0,
        refreshTokens: [],
        lastLoginAt: null,
        createdAt: new Date('2026-05-10T17:00:00Z'),
        updatedAt: new Date('2026-05-10T17:00:00Z'),
      },
      {
        _id: new ObjectId('6b008888888888888888hhhh'),
        fullName: 'FlowForge Admin',
        email: 'admin@flowforge.app',
        password: hashedPassword,
        organizationType: 'clinic',
        businessName: 'FlowForge Internal',
        logoUrl: null,
        role: 'admin',
        isEmailVerified: true,
        loginAttempts: 0,
        refreshTokens: [],
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
      },
    ];

    // Seed Users
    for (const u of seedUsers) {
      await User.updateOne({ email: u.email }, { $set: u }, { upsert: true });
    }
    console.log('Seed users inserted/updated');

    const seedProjects = [
      // 4 for Dr. Hassan (clinic)
      {
        userId: new ObjectId('6b001111111111111111aaaa'),
        name: 'Patient Appointment System',
        organizationName: 'City Health Clinic',
        category: 'clinic',
        status: 'live',
        liveUrl: 'https://chc-appointments.flowforge.app',
        isArchived: false,
        createdAt: new Date('2026-03-01T10:00:00Z'),
        updatedAt: new Date('2026-04-15T12:00:00Z'),
      },
      {
        userId: new ObjectId('6b001111111111111111aaaa'),
        name: 'Pharmacy Inventory Tracker',
        organizationName: 'City Health Clinic',
        category: 'clinic',
        status: 'spec_ready',
        isArchived: false,
        createdAt: new Date('2026-04-10T09:00:00Z'),
        updatedAt: new Date('2026-05-01T14:00:00Z'),
      },
      {
        userId: new ObjectId('6b001111111111111111aaaa'),
        name: 'Doctor Referral Network',
        organizationName: 'City Health Clinic',
        category: 'clinic',
        status: 'preview',
        stagingUrl: 'https://staging-chc-ref.flowforge.app',
        isArchived: false,
        createdAt: new Date('2026-04-20T11:00:00Z'),
        updatedAt: new Date('2026-05-08T09:30:00Z'),
      },
      {
        userId: new ObjectId('6b001111111111111111aaaa'),
        name: 'Lab Results Portal',
        organizationName: 'City Health Clinic',
        category: 'clinic',
        status: 'intake',
        isArchived: false,
        createdAt: new Date('2026-05-05T08:00:00Z'),
        updatedAt: new Date('2026-05-05T08:00:00Z'),
      },
      // 3 for Dr. Ayesha (clinic)
      {
        userId: new ObjectId('6b002222222222222222bbbb'),
        name: 'Maternal Care Tracker',
        organizationName: 'MediPlus Lahore',
        category: 'clinic',
        status: 'spec_ready',
        isArchived: false,
        createdAt: new Date('2026-04-01T10:00:00Z'),
        updatedAt: new Date('2026-05-01T10:00:00Z'),
      },
      {
        userId: new ObjectId('6b002222222222222222bbbb'),
        name: 'Vaccination Drive 2026',
        organizationName: 'MediPlus Lahore',
        category: 'clinic',
        status: 'live',
        liveUrl: 'https://mediplus-vax.flowforge.app',
        isArchived: false,
        createdAt: new Date('2026-03-15T09:00:00Z'),
        updatedAt: new Date('2026-05-05T12:00:00Z'),
      },
      {
        userId: new ObjectId('6b002222222222222222bbbb'),
        name: 'Old Patient Register',
        organizationName: 'MediPlus Lahore',
        category: 'clinic',
        status: 'intake',
        isArchived: true,
        createdAt: new Date('2026-01-15T09:00:00Z'),
        updatedAt: new Date('2026-02-01T12:00:00Z'),
      },
      // 3 for Imran (school)
      {
        userId: new ObjectId('6b003333333333333333cccc'),
        name: 'Student Admissions Portal',
        organizationName: 'Beacon Institute',
        category: 'school',
        status: 'live',
        liveUrl: 'https://beacon-admissions.flowforge.app',
        isArchived: false,
        createdAt: new Date('2026-02-01T09:00:00Z'),
        updatedAt: new Date('2026-03-20T10:00:00Z'),
      },
      {
        userId: new ObjectId('6b003333333333333333cccc'),
        name: 'Fee Collection System',
        organizationName: 'Beacon Institute',
        category: 'school',
        status: 'spec_ready',
        isArchived: false,
        createdAt: new Date('2026-03-15T11:00:00Z'),
        updatedAt: new Date('2026-04-10T14:00:00Z'),
      },
      {
        userId: new ObjectId('6b003333333333333333cccc'),
        name: 'Teacher Attendance Tracker',
        organizationName: 'Beacon Institute',
        category: 'school',
        status: 'intake',
        isArchived: false,
        createdAt: new Date('2026-05-08T10:00:00Z'),
        updatedAt: new Date('2026-05-08T10:00:00Z'),
      },
    ];

    // Seed Projects (using raw collection to avoid missing Model issues)
    const projectsColl = mongoose.connection.collection('projects');
    for (const p of seedProjects) {
      await projectsColl.updateOne(
        { userId: p.userId, name: p.name },
        { $set: p },
        { upsert: true }
      );
    }
    console.log('Seed projects inserted/updated');

    console.log('Seeding complete');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
