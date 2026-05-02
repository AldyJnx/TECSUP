const bcrypt = require('bcrypt');
const userRepository = require('../repositories/UserRepository');
const roleRepository = require('../repositories/RoleRepository');

async function seedUsers() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@tecsup.edu.pe';
  const existing = await userRepository.findByEmail(adminEmail);
  if (existing) return;

  const adminRole = await roleRepository.findByName('admin');
  const userRole = await roleRepository.findByName('user');
  if (!adminRole) {
    console.warn('[seed] No existe el rol admin, omitiendo seedUsers');
    return;
  }

  const salt = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
  const password = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin1234', salt);

  await userRepository.create({
    name: process.env.ADMIN_NAME || 'Admin',
    lastName: process.env.ADMIN_LASTNAME || 'Root',
    phoneNumber: '999999999',
    birthdate: new Date('1995-01-01'),
    email: adminEmail,
    password,
    roles: [adminRole._id, userRole ? userRole._id : null].filter(Boolean)
  });

  console.log(`[seed] Usuario admin creado: ${adminEmail}`);
}

module.exports = seedUsers;
