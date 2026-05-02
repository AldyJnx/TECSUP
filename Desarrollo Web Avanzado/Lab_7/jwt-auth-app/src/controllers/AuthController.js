
const authService = require('../services/AuthService');

class AuthController {
  async signUp(req, res, next) {
    try {
      const user = await authService.signUp(req.body);
      res.status(201).json({
        message: 'Usuario registrado correctamente',
        user
      });
    } catch (err) {
      next(err);
    }
  }

  async signIn(req, res, next) {
    try {
      const { token, user } = await authService.signIn(req.body);
      res.json({
        message: 'Inicio de sesion exitoso',
        token,
        user,
        roles: (user.roles || []).map(r => r.name)
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
