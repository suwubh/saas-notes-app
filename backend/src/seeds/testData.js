const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const seedTestUsers = async () => {
  try {
    console.log('Seeding test users...');

    const tenantsResult = await pool.query('SELECT id, slug FROM tenants');
    const tenants = {};
    tenantsResult.rows.forEach(tenant => {
      tenants[tenant.slug] = tenant.id;
    });

    const hashedPassword = await bcrypt.hash('password', 12);

    const users = [
      { tenant_id: tenants.acme, email: 'admin@acme.test', role: 'admin' },
      { tenant_id: tenants.acme, email: 'user@acme.test', role: 'member' },
      { tenant_id: tenants.globex, email: 'admin@globex.test', role: 'admin' },
      { tenant_id: tenants.globex, email: 'user@globex.test', role: 'member' }
    ];

    for (const user of users) {
      await pool.query(
        'INSERT INTO users (tenant_id, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
        [user.tenant_id, user.email, hashedPassword, user.role]
      );
    }

    console.log('Test users seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding test users:', error);
    process.exit(1);
  }
};

seedTestUsers();
