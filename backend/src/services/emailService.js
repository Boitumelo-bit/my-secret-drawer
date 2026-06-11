class EmailService {
  constructor() {
    this.apiKey = process.env.BREVO_API_KEY;
    this.senderEmail = 'boitumelomosiuoa2002@gmail.com';
    this.senderName = process.env.STORE_NAME || 'My Secret Drawer';
    console.log('Brevo API service ready');
  }

  async sendEmail({ to, subject, html }) {
    // Validate required fields
    if (!to) {
      console.error('❌ Email error: No recipient provided');
      return { success: false, error: 'No recipient' };
    }
    
    if (!subject) {
      console.error('❌ Email error: No subject provided for', to);
      // Use default subject instead of failing
      subject = 'Message from My Secret Drawer';
    }
    
    if (!html) {
      html = '<p>Thank you for being a valued customer.</p>';
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify({
          sender: {
            name: this.senderName,
            email: this.senderEmail
          },
          to: [{ email: to }],
          subject: subject,
          htmlContent: html
        })
      });

      if (response.ok) {
        console.log(`✅ Email sent to ${to}: ${subject}`);
        return { success: true };
      } else {
        const error = await response.json();
        console.error('❌ Email error:', error.message);
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('❌ Email error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();