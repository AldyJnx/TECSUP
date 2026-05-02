const userService = require('../services/UserService');

class UserController {
  async getAll(req, res, next) {
    try {
      const users = await userService.getAll();
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await userService.getById(req.userId);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const user = await userService.getById(req.params.id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async updateMe(req, res, next) {
    try {
      const user = await userService.update(req.userId, req.body);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const user = await userService.createByAdmin(req.body);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const user = await userService.update(req.params.id, req.body, {
        allowRoleChange: true,
        allowActiveChange: true
      });
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async remove(req, res, next) {
    try {
      if (req.params.id === req.userId) {
        return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta' });
      }
      await userService.remove(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
