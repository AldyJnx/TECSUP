const bcrypt = require('bcrypt');
const userRepository = require('../repositories/UserRepository');
const roleRepository = require('../repositories/RoleRepository');

class UserService {
  async getAll() {
    return userRepository.findAll();
  }

  async getById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      const err = new Error('Usuario no encontrado');
      err.status = 404;
      throw err;
    }
    return user;
  }

  async createByAdmin(data) {
    const required = ['name', 'lastName', 'email', 'password'];
    for (const key of required) {
      if (!data[key]) {
        const err = new Error(`Campo requerido: ${key}`);
        err.status = 400;
        throw err;
      }
    }

    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      const err = new Error('El email ya esta registrado');
      err.status = 409;
      throw err;
    }

    const salt = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    const hashed = await bcrypt.hash(data.password, salt);

    const roleNames = data.roles && data.roles.length ? data.roles : ['user'];
    const roleDocs = await roleRepository.findByNames(roleNames);
    if (!roleDocs.length) {
      const err = new Error('No se encontraron roles validos');
      err.status = 400;
      throw err;
    }

    return userRepository.create({
      name: data.name,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      birthdate: data.birthdate || null,
      email: data.email,
      password: hashed,
      roles: roleDocs.map(r => r._id),
      active: data.active !== undefined ? !!data.active : true
    });
  }

  async update(id, data, { allowRoleChange = false, allowActiveChange = false } = {}) {
    const allowed = ['name', 'lastName', 'phoneNumber', 'birthdate', 'email'];
    const payload = {};
    for (const key of allowed) {
      if (data[key] !== undefined && data[key] !== '') payload[key] = data[key];
    }

    if (data.password) {
      const salt = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
      payload.password = await bcrypt.hash(data.password, salt);
    }

    if (allowRoleChange && Array.isArray(data.roles) && data.roles.length) {
      const roleDocs = await roleRepository.findByNames(data.roles);
      if (!roleDocs.length) {
        const err = new Error('No se encontraron roles validos');
        err.status = 400;
        throw err;
      }
      payload.roles = roleDocs.map(r => r._id);
    }

    if (allowActiveChange && data.active !== undefined) {
      payload.active = !!data.active;
    }

    const updated = await userRepository.updateById(id, payload);
    if (!updated) {
      const err = new Error('Usuario no encontrado');
      err.status = 404;
      throw err;
    }
    return updated;
  }

  async remove(id) {
    const deleted = await userRepository.deleteById(id);
    if (!deleted) {
      const err = new Error('Usuario no encontrado');
      err.status = 404;
      throw err;
    }
    return deleted;
  }
}

module.exports = new UserService();
