import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/User.model';
import { ObjectId } from 'mongodb';

export const runSeed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.JWT_ACCESS_SECRET) {
       res.status(403).json({ success: false, message: 'Unauthorized seed attempt' });
       return;
    }

    console.log('Starting remote migration and seeding...');

    // 1. MIGRATION: Normalize users
    const migrationResult = await mongoose.connection.collection('users').updateMany(
      { orgType: { $exists: true } },
      [
        {
          $set: {
            organizationType: '$orgType',
            isEmailVerified: { $ifNull: ['$isEmailVerified', true] },
            businessName: { $ifNull: ['$businessName', ''] },
            logoUrl: { $ifNull: ['$logoUrl', null] },
            role: { $ifNull: ['$role', 'user'] },
            loginAttempts: { $ifNull: ['$loginAttempts', 0] },
          }
        },
        { $unset: 'orgType' }
      ]
    );

    // 2. SEEDING: Prepare data
    const hashedPassword = await bcrypt.hash('Test@1234', 12);
    
    const seedUsers = [
      {
        _id: new ObjectId('6b001111111111111111aaaa'),
        fullName: 'Dr. Hassan Khalid',
        email: 'hassan@cityhealthclinic.com',
        password: hashedPassword,
        organizationType: 'clinic',
        businessName: 'City Health Clinic',
        role: 'user',
        isEmailVerified: true,
      },
      {
        _id: new ObjectId('6b003333333333333333cccc'),
        fullName: 'Imran Qureshi',
        email: 'imran@beaconinstitute.edu.pk',
        password: hashedPassword,
        organizationType: 'school',
        businessName: 'Beacon Institute',
        role: 'user',
        isEmailVerified: true,
      },
      {
        _id: new ObjectId('6b007777777777777777gggg'),
        fullName: 'Usman Farhan',
        email: 'usman@newuser.com',
        password: hashedPassword,
        organizationType: 'clinic',
        businessName: '',
        role: 'user',
        isEmailVerified: true,
      },
      {
        _id: new ObjectId('6b008888888888888888hhhh'),
        fullName: 'FlowForge Admin',
        email: 'admin@flowforge.app',
        password: hashedPassword,
        organizationType: 'clinic',
        businessName: 'FlowForge Internal',
        role: 'admin',
        isEmailVerified: true,
      }
    ];

    for (const u of seedUsers) {
      await User.updateOne({ email: u.email }, { $set: u }, { upsert: true });
    }

    const seedProjects = [
      {
        userId: new ObjectId('6b001111111111111111aaaa'),
        name: 'Patient Appointment System',
        organizationName: 'City Health Clinic',
        category: 'clinic',
        status: 'live',
        liveUrl: 'https://chc-appointments.flowforge.app',
        isArchived: false,
        updatedAt: new Date(),
      },
      {
        userId: new ObjectId('6b001111111111111111aaaa'),
        name: 'Pharmacy Inventory Tracker',
        organizationName: 'City Health Clinic',
        category: 'clinic',
        status: 'spec_ready',
        isArchived: false,
        updatedAt: new Date(),
      },
      {
        userId: new ObjectId('6b003333333333333333cccc'),
        name: 'Student Admissions Portal',
        organizationName: 'Beacon Institute',
        category: 'school',
        status: 'live',
        liveUrl: 'https://beacon-admissions.flowforge.app',
        isArchived: false,
        updatedAt: new Date(),
      }
    ];

    const projectsColl = mongoose.connection.collection('projects');
    for (const p of seedProjects) {
      await projectsColl.updateOne(
        { userId: p.userId, name: p.name },
        { $set: p },
        { upsert: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Seeding and Migration complete',
      migratedCount: migrationResult.modifiedCount,
      usersUpserted: seedUsers.length,
      projectsUpserted: seedProjects.length
    });
  } catch (err) {
    next(err);
  }
};
