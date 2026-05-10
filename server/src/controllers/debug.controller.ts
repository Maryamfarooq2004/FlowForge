import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { Project } from '../models/Project.model';
import { sendSuccess } from '../utils/response.utils';

export const seedDatabase = async (req: Request, res: Response) => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});

    // 1. Create Clinic User
    const user = await User.create({
      fullName: 'Dr. Maryam Farooq',
      email: 'maryam@alshifaclinic.com',
      password: 'Password123!',
      organizationType: 'clinic',
      isEmailVerified: true,
      businessName: 'Al-Shifa Medical Center',
    });

    // 2. Create Projects
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
      }
    ];

    await Project.insertMany(projects);

    sendSuccess(res, null, 'Database seeded successfully with Maryam Clinic data');
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
