module.exports = function authorize(allowedRoles = []) {
  return function (req, res, next) {
    const userRoles = req.userRoles || [];
    const ok = allowedRoles.some(role => userRoles.includes(role));
    if (!ok) {
      return res.status(403).json({ message: 'Acceso denegado: rol insuficiente' });
    }
    next();
  };
};
