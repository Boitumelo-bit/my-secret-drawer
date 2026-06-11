// Store info from env
const storeName = process.env.STORE_NAME || 'My Secret Drawer';
const storeAddress = process.env.STORE_ADDRESS || 'Maseru, Lesotho';
const storePhone = process.env.STORE_PHONE || '+266 6361 2444';
const storeWhatsapp = process.env.STORE_WHATSAPP || '+266 6361 2444';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// Helper to create spam-safe email wrapper
const createEmailWrapper = (content, preheader = '') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>My Secret Drawer</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #FF1493, #FF69B4); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #FF1493; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; }
    .footer { text-align: center; padding: 20px; color: #888888; font-size: 12px; }
    hr { border: none; border-top: 1px solid #eeeeee; margin: 30px 0; }
    h1 { color: #ffffff; margin: 0; font-size: 24px; }
    h2 { color: #333333; margin: 0 0 15px 0; font-size: 20px; }
    p { color: #555555; line-height: 1.6; margin: 0 0 15px 0; font-size: 15px; }
    ul { color: #555555; line-height: 1.6; margin: 0 0 15px 0; padding-left: 20px; }
    li { margin-bottom: 8px; }
    .warning { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b; }
    .info { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; }
    @media only screen and (max-width: 480px) {
      .container { padding: 10px; }
      .content { padding: 20px; }
      h1 { font-size: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
    <div class="footer">
      <p>${storeName}<br>${storeAddress}<br>Phone/WhatsApp: ${storePhone}</p>
      <p><a href="${frontendUrl}/unsubscribe" style="color: #888888; text-decoration: underline;">Unsubscribe</a> | <a href="${frontendUrl}" style="color: #888888; text-decoration: underline;">Visit our store</a></p>
      <p>&copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Welcome Email Template
const welcomeEmail = (name) => ({
  subject: `Welcome to ${storeName}!`,
  html: createEmailWrapper(`
    <div class="header">
      <h1>Welcome to My Secret Drawer</h1>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>Thank you for joining My Secret Drawer! We're excited to have you as part of our community.</p>
      <p>You can now:</p>
      <ul>
        <li>Shop our exclusive fashion and beauty collections</li>
        <li>Save items to your wishlist</li>
        <li>Track your orders</li>
        <li>Earn loyalty points on every purchase</li>
      </ul>
      <div style="text-align: center;">
        <a href="${frontendUrl}/products" class="button">Start Shopping</a>
      </div>
      <hr>
      <p style="font-size: 12px; text-align: center; color: #888;">You received this email because you created an account at ${storeName}.</p>
    </div>
  `)
});

// Login Notification Email
const loginNotificationEmail = (name, time, location = 'Unknown location') => ({
  subject: `New Login to Your ${storeName} Account`,
  html: createEmailWrapper(`
    <div class="header">
      <h1 style="font-size: 20px;">New Login Alert</h1>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>We noticed a new login to your account.</p>
      <div class="info">
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Location:</strong> ${location}</p>
      </div>
      <p>If this was you, you can ignore this email.</p>
      <div class="warning">
        <p><strong>Not you?</strong> Please reset your password immediately.</p>
      </div>
      <div style="text-align: center;">
        <a href="${frontendUrl}/reset-password" class="button">Reset Password</a>
      </div>
      <hr>
      <p style="font-size: 12px; text-align: center; color: #888;">You received this email because someone logged into your ${storeName} account.</p>
    </div>
  `)
});

// Order Confirmation Email
const orderConfirmationEmail = (name, orderNumber, total, itemsCount) => ({
  subject: `Order Confirmed - ${orderNumber}`,
  html: createEmailWrapper(`
    <div class="header">
      <h1>Order Confirmed</h1>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
      <div class="info">
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Total Amount:</strong> LSL ${total.toFixed(2)}</p>
        <p><strong>Number of Items:</strong> ${itemsCount}</p>
      </div>
      <div style="text-align: center;">
        <a href="${frontendUrl}/track-order/${orderNumber}" class="button">Track Your Order</a>
      </div>
      <hr>
      <p style="font-size: 12px; text-align: center; color: #888;">You received this email because you placed an order at ${storeName}.</p>
    </div>
  `)
});

// Admin New Order Notification
const adminNewOrderEmail = (orderNumber, customerName, total) => ({
  subject: `New Order Received - ${orderNumber}`,
  html: createEmailWrapper(`
    <div class="header">
      <h1>New Order Received</h1>
    </div>
    <div class="content">
      <div class="info">
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Total:</strong> LSL ${total.toFixed(2)}</p>
      </div>
      <div style="text-align: center;">
        <a href="${frontendUrl}/admin/orders/${orderNumber}" class="button">View Order</a>
      </div>
    </div>
  `)
});

// Order Status Update Email
const orderStatusUpdateEmail = (name, orderNumber, oldStatus, newStatus) => ({
  subject: `Order Status Update - ${orderNumber}`,
  html: createEmailWrapper(`
    <div class="header">
      <h1>Order Status Update</h1>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>Your order status has been updated:</p>
      <div class="info">
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Status Changed:</strong> ${oldStatus} → ${newStatus}</p>
      </div>
      <div style="text-align: center;">
        <a href="${frontendUrl}/track-order/${orderNumber}" class="button">Track Your Order</a>
      </div>
    </div>
  `)
});

module.exports = {
  welcomeEmail,
  loginNotificationEmail,
  orderConfirmationEmail,
  adminNewOrderEmail,
  orderStatusUpdateEmail
};