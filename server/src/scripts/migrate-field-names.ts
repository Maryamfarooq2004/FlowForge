import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env from server directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function migrateFieldNames() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI is not defined in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');

    // Fix all documents that have 'orgType' instead of 'organizationType'
    const result = await mongoose.connection.collection('users').updateMany(
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

    console.log(`Migrated ${result.modifiedCount} user documents`);

    // Also remove any stray field 'lastLoginIp' if it was added accidentally
    await mongoose.connection.collection('users').updateMany(
      { lastLoginIp: { $exists: true } },
      { $unset: { lastLoginIp: '' } }
    );

    console.log('Migration complete');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

migrateFieldNames();
