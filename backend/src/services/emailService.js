const SibApiV3Sdk = require('sib-api-v3-sdk');

class EmailService {
  constructor() {
    // Initialize Brevo API
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    
    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    this.senderEmail = 'boitumelomosiuoa2002@gmail.com';
    this.senderName = process.env.STORE_NAME || 'My Secret Drawer';
    console.log('Brevo API service ready');
  }

  async sendEmail({ to, subject, html }) {
    try {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html;
      sendSmtpEmail.sender = { 
        name: this.senderName, 
        email: this.senderEmail 
      };
      sendSmtpEmail.to = [{ email: to }];

      const data = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`Email sent to ${to}`);
      return { success: true, data };
    } catch (error) {
      console.error('Email error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();