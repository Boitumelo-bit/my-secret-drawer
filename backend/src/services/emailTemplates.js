// Welcome Email Template
const welcomeEmail = (name) => ({
  subject: '🎉 Welcome to My Secret Drawer!',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to My Secret Drawer</title>
      <style>
        body { margin: 0; padding: 0; background-color: #f9f9f9; font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF1493, #FF69B4); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .button { display: inline-block; background: linear-gradient(135deg, #FF1493, #FF69B4); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
        hr { border: none; border-top: 1px solid #eee; margin: 30px 0; }
        h1 { color: white; margin: 0; font-size: 24px; }
        h2 { color: #333; margin: 0 0 15px 0; }
        p { color: #666; line-height: 1.6; margin: 0 0 15px 0; }
        ul { color: #666; line-height: 1.6; margin: 0 0 15px 0; padding-left: 20px; }
        li { margin-bottom: 8px; }
        @media only screen and (max-width: 480px) {
          .container { padding: 10px; }
          .content { padding: 20px; }
          h1 { font-size: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ Welcome to My Secret Drawer ✨</h1>
        </div>
        <div class="content">
          <h2>Hi ${name}! 👋</h2>
          <p>Thank you for joining My Secret Drawer! We're excited to have you as part of our community. 💕</p>
          <p>You can now:</p>
          <ul>
            <li>🛍️ Shop our exclusive fashion and beauty collections</li>
            <li>❤️ Save items to your wishlist</li>
            <li>📦 Track your orders</li>

          </ul>
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/products" class="button">Start Shopping 🛒</a>
          </div>
          <hr>
          <div class="footer">
            💖 My Secret Drawer - Luxury fashion and beauty curated for the modern African woman. 💖
          </div>
        </div>
      </div>
    </body>
    </html>
  `
});

// Login Notification Email
const loginNotificationEmail = (name, time, location = 'Unknown location') => ({
  subject: '🔐 New Login to Your Account',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Login Alert</title>
      <style>
        body { margin: 0; padding: 0; background-color: #f9f9f9; font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF1493, #FF69B4); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
        hr { border: none; border-top: 1px solid #eee; margin: 30px 0; }
        h2 { color: #FF1493; margin: 0 0 15px 0; }
        p { color: #666; line-height: 1.6; margin: 0 0 10px 0; }
        .alert-box { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 15px 0; }
        @media only screen and (max-width: 480px) {
          .container { padding: 10px; }
          .content { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="color: white; margin: 0;">🔐 New Login Alert</h2>
        </div>
        <div class="content">
          <p>Hi ${name}, 👋</p>
          <p>We noticed a new login to your account:</p>
          <div class="alert-box">
            <p>⏰ <strong>Time:</strong> ${time}</p>
            <p>📍 <strong>Location:</strong> ${location}</p>
          </div>
          <p>✅ If this was you, you can ignore this email.</p>
          <p>⚠️ If this wasn't you, please reset your password immediately.</p>
          <hr>
          <div class="footer">
            🔒 My Secret Drawer - Secure your account
          </div>
        </div>
      </div>
    </body>
    </html>
  `
});

// Order Confirmation Email
const orderConfirmationEmail = (name, orderNumber, total, itemsCount) => ({
  subject: `✅ Order Confirmed - ${orderNumber}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmed</title>
      <style>
        body { margin: 0; padding: 0; background-color: #f9f9f9; font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF1493, #FF69B4); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .summary-box { background: #f5f5f5; padding: 15px; border-radius: 10px; margin: 20px 0; }
        .button { display: inline-block; background: #FF1493; color: white; padding: 10px 25px; text-decoration: none; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
        hr { border: none; border-top: 1px solid #eee; margin: 30px 0; }
        h2 { color: #FF1493; margin: 0 0 15px 0; }
        p { color: #666; line-height: 1.6; margin: 0 0 10px 0; }
        @media only screen and (max-width: 480px) {
          .container { padding: 10px; }
          .content { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="color: white; margin: 0;">✅ Order Confirmed</h2>
        </div>
        <div class="content">
          <p>Hi ${name}, 👋</p>
          <p>Your order <strong>${orderNumber}</strong> has been confirmed. 🎉</p>
          <div class="summary-box">
            <p>💰 <strong>Total Amount:</strong> LSL ${total.toFixed(2)}</p>
            <p>📦 <strong>Number of Items:</strong> ${itemsCount}</p>
          </div>
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/track-order/${orderNumber}" class="button">Track Order 📍</a>
          </div>
          <hr>
          <div class="footer">
            💖 My Secret Drawer - Thank you for shopping with us 💖
          </div>
        </div>
      </div>
    </body>
    </html>
  `
});

// Admin New Order Notification
const adminNewOrderEmail = (orderNumber, customerName, total) => ({
  subject: `🛍️ New Order - ${orderNumber}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Notification</title>
      <style>
        body { margin: 0; padding: 0; background-color: #f9f9f9; font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF1493, #FF69B4); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .order-box { background: #f5f5f5; padding: 15px; border-radius: 10px; margin: 20px 0; }
        .button { display: inline-block; background: #FF1493; color: white; padding: 10px 25px; text-decoration: none; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
        hr { border: none; border-top: 1px solid #eee; margin: 30px 0; }
        h2 { color: #FF1493; margin: 0 0 15px 0; }
        p { color: #666; line-height: 1.6; margin: 0 0 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="color: white; margin: 0;">🛍️ New Order Received</h2>
        </div>
        <div class="content">
          <div class="order-box">
            <p>📋 <strong>Order Number:</strong> ${orderNumber}</p>
            <p>👤 <strong>Customer:</strong> ${customerName}</p>
            <p>💰 <strong>Total:</strong> LSL ${total.toFixed(2)}</p>
          </div>
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/admin/orders" class="button">View Order 👁️</a>
          </div>
          <hr>
          <div class="footer">
            📢 My Secret Drawer - Admin Notification
          </div>
        </div>
      </div>
    </body>
    </html>
  `
});

// Order Status Update Email
const orderStatusUpdateEmail = (name, orderNumber, oldStatus, newStatus) => ({
  subject: `📦 Order Status Update - ${orderNumber}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Status Update</title>
      <style>
        body { margin: 0; padding: 0; background-color: #f9f9f9; font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF1493, #FF69B4); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .status-box { background: #f5f5f5; padding: 15px; border-radius: 10px; margin: 20px 0; text-align: center; }
        .old-status { background: #ddd; padding: 5px 15px; border-radius: 20px; display: inline-block; }
        .new-status { background: #4CAF50; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; }
        .arrow { font-size: 20px; margin: 0 10px; }
        .button { display: inline-block; background: #FF1493; color: white; padding: 10px 25px; text-decoration: none; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
        hr { border: none; border-top: 1px solid #eee; margin: 30px 0; }
        h2 { color: #FF1493; margin: 0 0 15px 0; }
        p { color: #666; line-height: 1.6; margin: 0 0 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="color: white; margin: 0;">📦 Order Status Update</h2>
        </div>
        <div class="content">
          <p>Hi ${name}, 👋</p>
          <p>Your order <strong>${orderNumber}</strong> status has been updated:</p>
          <div class="status-box">
            <span class="old-status">${oldStatus}</span>
            <span class="arrow">→</span>
            <span class="new-status">${newStatus}</span>
          </div>
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/track-order/${orderNumber}" class="button">Track Order 📍</a>
          </div>
          <hr>
          <div class="footer">
            🚚 My Secret Drawer - Order Management
          </div>
        </div>
      </div>
    </body>
    </html>
  `
});

module.exports = {
  welcomeEmail,
  loginNotificationEmail,
  orderConfirmationEmail,
  adminNewOrderEmail,
  orderStatusUpdateEmail
};
const storeName = process.env.STORE_NAME || 'My Secret Drawer';
const storeAddress = process.env.STORE_ADDRESS || 'Maseru, Lesotho';
const storePhone = process.env.STORE_PHONE || '+266 6361 2444';
const storeWhatsapp = process.env.STORE_WHATSAPP || '+266 6361 2444';
