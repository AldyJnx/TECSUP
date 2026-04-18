const BaseRepository = require("./BaseRepository");

class NotificationRepository extends BaseRepository {
  constructor() {
    super("notifications");
  }

  findByTicketId(ticketId) {
    const all = this.findAll();
    return all.filter(notification => notification.ticketId === ticketId);
  }
}

module.exports = NotificationRepository;
