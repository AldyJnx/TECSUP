const Role = require('../models/Role');

class RoleRepository {
  async findAll() {
    return Role.find().exec();
  }

  async findByName(name) {
    return Role.findOne({ name: name.toLowerCase() }).exec();
  }

  async findByNames(names) {
    return Role.find({ name: { $in: names.map(n => n.toLowerCase()) } }).exec();
  }

  async create(data) {
    return Role.create(data);
  }
}

module.exports = new RoleRepository();
