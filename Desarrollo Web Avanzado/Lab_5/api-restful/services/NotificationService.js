const { v4: uuidv4 } = require("uuid");
const NotificationRepository = require("../repositories/NotificationRepository");
const EmailService = require("./email/EmailService");

class NotificationService {
  constructor() {
    this.repo = new NotificationRepository();
    this.emailService = new EmailService();
  }

  create(type, message, ticketId) {
    const notification = {
      id: uuidv4(),
      type,
      message,
      status: "pending",
      ticketId
    };
    console.log("Creando notificación tipo:", type);
    if (type == "email") {
      console.log("Enviando email...");
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #2c3e50; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Sistema de Tickets</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
            <h2 style="color: #2c3e50; margin-top: 0;">Notificacion</h2>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">${message}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 14px; color: #666;">
              <strong>ID del Ticket:</strong> ${ticketId}
            </p>
            <p style="font-size: 12px; color: #999;">
              Fecha: ${new Date().toLocaleString('es-PE')}
            </p>
          </div>
          <div style="background-color: #2c3e50; color: white; padding: 10px; text-align: center; font-size: 12px;">
            API RESTful - Lab 5
          </div>
        </div>
      `;
      this.emailService.sendEmail({
        to: "aldyjenxymc@gmail.com",
        subject: "Sistema de Tickets - Notificacion",
        htmlBody: htmlBody
      });
    }
    return this.repo.save(notification);
  }

  list() {
    return this.repo.findAll();
  }

  getByTicketId(ticketId) {
    return this.repo.findByTicketId(ticketId);
  }
}
module.exports = NotificationService;
