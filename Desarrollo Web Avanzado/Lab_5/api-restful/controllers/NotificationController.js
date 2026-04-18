const NotificationService = require("../services/NotificationService");
const service = new NotificationService();

exports.list = (req, res) => {
  res.status(200).json(service.list());
};
