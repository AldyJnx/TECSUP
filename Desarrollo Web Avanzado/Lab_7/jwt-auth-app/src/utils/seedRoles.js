const roleRepository = require('../repositories/RoleRepository');

async function seedRoles() {
  const defaults = [
    { name: 'user', description: 'Usuario estandar' },
    { name: 'admin', description: 'Administrador del sistema' }
  ];

  for (const role of defaults) {
    const existing = await roleRepository.findByName(role.name);
    if (!existing) {
      await roleRepository.create(role);
      console.log(`[seed] Rol creado: ${role.name}`);
    }
  }
}

module.exports = seedRoles;
