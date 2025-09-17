import { getDatabase, createTenant, createUser } from '../src/lib/database';
import { hashPassword } from '../src/lib/auth';

async function seedDatabase() {
  try {
    console.log('Seeding database...');

    // Create tenants
    const acmeTenantId = await createTenant({
      name: 'Acme Corp',
      slug: 'acme',
      plan: 'free'
    });

    const globexTenantId = await createTenant({
      name: 'Globex Corporation',
      slug: 'globex', 
      plan: 'free'
    });

    console.log('Tenants created:', { acmeTenantId, globexTenantId });

    // Create test users
    const hashedPassword = await hashPassword('password');

    // Acme users
    await createUser({
      email: 'admin@acme.test',
      password: hashedPassword,
      role: 'admin',
      tenantId: acmeTenantId
    });

    await createUser({
      email: 'user@acme.test', 
      password: hashedPassword,
      role: 'member',
      tenantId: acmeTenantId
    });

    // Globex users
    await createUser({
      email: 'admin@globex.test',
      password: hashedPassword,
      role: 'admin',
      tenantId: globexTenantId
    });

    await createUser({
      email: 'user@globex.test',
      password: hashedPassword,
      role: 'member', 
      tenantId: globexTenantId
    });

    console.log('Test users created successfully!');
    console.log('Test accounts:');
    console.log('- admin@acme.test (Admin, Acme tenant)');
    console.log('- user@acme.test (Member, Acme tenant)');
    console.log('- admin@globex.test (Admin, Globex tenant)');
    console.log('- user@globex.test (Member, Globex tenant)');
    console.log('Password for all accounts: password');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();