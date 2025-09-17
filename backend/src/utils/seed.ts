import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Tenant } from '../models/Tenant';
import { hashPassword } from './auth';

dotenv.config();

async function seedDatabase() {
  try {
    const password = process.env.MONGODB_PASSWORD;
    const mongoURI = process.env.MONGODB_URI || 
      (password ? `mongodb+srv://23bei048_db_user:${password}@clusterforinternship.isdoq2h.mongodb.net/noteshub?retryWrites=true&w=majority` : 
       'mongodb://localhost:27017/noteshub');
    
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Tenant.deleteMany({});
    console.log('Cleared existing data');

    // Create tenants
    const acmeTenant = new Tenant({
      name: 'Acme Corporation',
      slug: 'acme',
      plan: 'free',
      maxNotes: 3,
    });

    const globexTenant = new Tenant({
      name: 'Globex Corporation',
      slug: 'globex',
      plan: 'free',
      maxNotes: 3,
    });

    await acmeTenant.save();
    await globexTenant.save();
    console.log('Created tenants');

    // Create test users
    const testUsers = [
      {
        email: 'admin@acme.test',
        password: await hashPassword('password'),
        role: 'admin' as const,
        tenantId: acmeTenant._id,
      },
      {
        email: 'user@acme.test',
        password: await hashPassword('password'),
        role: 'member' as const,
        tenantId: acmeTenant._id,
      },
      {
        email: 'admin@globex.test',
        password: await hashPassword('password'),
        role: 'admin' as const,
        tenantId: globexTenant._id,
      },
      {
        email: 'user@globex.test',
        password: await hashPassword('password'),
        role: 'member' as const,
        tenantId: globexTenant._id,
      },
    ];

    await User.insertMany(testUsers);
    console.log('Created test users');

    console.log('Database seeded successfully!');
    console.log('\nTest accounts:');
    console.log('- admin@acme.test / password (Admin, Acme)');
    console.log('- user@acme.test / password (Member, Acme)');
    console.log('- admin@globex.test / password (Admin, Globex)');
    console.log('- user@globex.test / password (Member, Globex)');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
