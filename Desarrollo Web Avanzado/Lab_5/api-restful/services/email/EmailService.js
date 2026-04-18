const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

class EmailService {

  constructor() { 
    
    this.transporter = nodemailer.createTransport({
      service: process.env.MAILER_SERVICE,
      auth: {
        user: process.env.MAILER_EMAIL,
        pass: process.env.MAILER_SECRET_KEY,
      }
    });
  }

  sendEmail( options ) {

    const { to, subject, htmlBody } = options;
    console.log("Intentando enviar email a:", to);
    console.log("Desde:", process.env.MAILER_EMAIL);

    try {
      this.transporter.sendMail( {
        from: process.env.MAILER_EMAIL,
        to: to,
        subject: subject,
        html: htmlBody
      })
      .then((info) => {
        console.log(" Email enviado:", info.response); 
      }).catch((err) => {
        console.error("Error enviando el email:", err); 
      });

      return true;
    } catch ( error ) {
      return false;
    }

  }
}

module.exports = EmailService;
