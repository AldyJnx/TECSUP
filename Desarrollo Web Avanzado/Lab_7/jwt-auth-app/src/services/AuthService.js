const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userRepository = require('../repositories/UserRepository');
const roleRepository = require('../repositories/RoleRepository');

class AuthService {
  async signUp({ name, lastName, phoneNumber, birthdate, email, password }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      const err = new Error('El email ya esta registrado');
      err.status = 409;
      throw err;
    }

    const salt = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    const hashed = await bcrypt.hash(password, salt);

    const roleDocs = await roleRepository.findByNames(['user']);

    if (!roleDocs.length) {
      const err = new Error('No se encontraron roles validos');
      err.status = 400;
      throw err;
    }

    const created = await userRepository.create({
      name,
      lastName,
      phoneNumber,
      birthdate,
      email,
      password: hashed,
      roles: roleDocs.map(r => r._id)
    });

    return created;
  }

  async signIn({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const err = new Error('Credenciales invalidas');
      err.status = 401;
      throw err;
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      const err = new Error('Credenciales invalidas');
      err.status = 401;
      throw err;
    }

    if (user.active === false) {
      const err = new Error('La cuenta esta inactiva');
      err.status = 403;
      throw err;
    }

    const roles = (user.roles || []).map(r => r.name);
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      roles
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES || '2h'
    });

    return {
      token,
      user
    };
  }
}

module.exports = new AuthService();
