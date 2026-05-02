const User = require('../models/User');

class UserRepository {
  async findAll() {
    return User.find().populate('roles').exec();
  }

  async findById(id) {
    return User.findById(id).populate('roles').exec();
  }

  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase() }).populate('roles').exec();
  }

  async create(data) {
    const created = await User.create(data);
    return User.findById(created._id).populate('roles').exec();
  }

  async updateById(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('roles')
      .exec();
  }

  async deleteById(id) {
    return User.findByIdAndDelete(id).exec();
  }
}

module.exports = new UserRepository();
