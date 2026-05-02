const jwt = require('jsonwebtoken');

module.exports = function authenticate(req, res, next) {
  const header = req.headers['authorization'] || req.headers['Authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = header.substring('Bearer '.length).trim();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    req.userEmail = payload.email;
    req.userRoles = payload.roles || [];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Token invalido' });
  }
};
