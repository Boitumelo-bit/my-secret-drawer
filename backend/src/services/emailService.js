const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: 'boitumelomosiuoa2002@gmail.com',
        pass: process.env.BREVO_API_KEY
      }
    });
    this.senderEmail = 'boitumelomosiuoa2002@gmail.com';
    this.senderName = process.env.STORE_NAME || 'My Secret Drawer';
    console.log('Brevo SMTP service ready');
  }

  async sendEmail({ to, subject, html }) {
    try {
      const info = await this.transporter.sendMail({
        from: `"${this.senderName}" <${this.senderEmail}>`,
        to: to,
        subject: subject,
        html: html
      });
      console.log(`✅ Email sent to ${to}`);
      return { success: true, data: info };
    } catch (error) {
      console.error('❌ Email error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();