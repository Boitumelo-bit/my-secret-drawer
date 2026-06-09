const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');
const { orderConfirmationEmail, adminNewOrderEmail, orderStatusUpdateEmail } = require('../services/emailTemplates');

const router = express.Router();
const prisma = new PrismaClient();

// Verify Token Middleware
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, isActive: true }
    });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Create order
router.post('/', verifyToken, async (req, res) => {
  try {
    const { items, paymentMethod, deliveryMethod, total, subtotal, shippingFee, tax } = req.body;
    const orderNumber = `MSD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const paymentMethodMap = {
      'card': 'PAYFAST',
      'payfast': 'PAYFAST',
      'ozow': 'OZOW',
      'yoco': 'YOCO',
      'eft': 'EFT',
      'cod': 'COD',
      'mobile_money': 'MOBILE_MONEY',
      'mpesa': 'MPESA',
      'ecocash': 'ECOCASH'
    };
    
    const mappedPaymentMethod = paymentMethodMap[paymentMethod?.toLowerCase()] || 'PAYFAST';
    
    const deliveryMethodMap = {
      'maseru': 'MASERU_SAME_DAY',
      'lesotho': 'LESOTHO_DISTRICTS',
      'southafrica': 'SOUTH_AFRICA_COURIER',
      'south_africa': 'SOUTH_AFRICA_COURIER',
      'pickup': 'STORE_PICKUP'
    };
    
    const mappedDeliveryMethod = deliveryMethodMap[deliveryMethod?.toLowerCase()] || 'MASERU_SAME_DAY';
    
    const orderItems = items.map(item => ({
      productId: String(item.id || item.productId),
      quantity: Number(item.quantity),
      price: Number(item.price),
      size: item.size || null,
      color: item.color || null
    }));
    
    // Get user details for emails
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { name: true, email: true }
    });
    
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        orderNumber,
        subtotal: Number(subtotal),
        shippingFee: Number(shippingFee),
        tax: Number(tax),
        total: Number(total),
        paymentMethod: mappedPaymentMethod,
        deliveryMethod: mappedDeliveryMethod,
        status: 'PENDING',
        items: {
          create: orderItems
        }
      },
      include: { items: { include: { product: true } } }
    });
    
    // Send order confirmation email to customer
    try {
      const itemsCount = order.items.length;
      await emailService.sendEmail({
        to: user.email,
        subject: orderConfirmationEmail(user.name, orderNumber, total, itemsCount).subject,
        html: orderConfirmationEmail(user.name, orderNumber, total, itemsCount).html
      });
      console.log(`Order confirmation email sent to ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError.message);
    }
    
    // Send admin notification email
    try {
      // Get all admin emails
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN', isActive: true },
        select: { email: true }
      });
      
      for (const admin of admins) {
        await emailService.sendEmail({
          to: admin.email,
          subject: adminNewOrderEmail(orderNumber, user.name, total).subject,
          html: adminNewOrderEmail(orderNumber, user.name, total).html
        });
      }
      console.log(`Admin notification sent for order ${orderNumber}`);
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError.message);
    }
    
    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get my orders (Customer only)
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { 
        items: { 
          include: { 
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true
              }
            }
          } 
        } 
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all orders (Employee/Admin only)
router.get('/all', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'EMPLOYEE' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const orders = await prisma.order.findMany({
      include: {
        user: { 
          select: { 
            id: true, 
            name: true, 
            email: true,
            phone: true
          } 
        },
        items: { 
          include: { 
            product: { 
              select: { 
                id: true, 
                name: true, 
                images: true, 
                price: true 
              } 
            } 
          } 
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Fetch all orders error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single order by number (for tracking)
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
      include: { 
        items: { 
          include: { 
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true
              }
            }
          } 
        } 
      }
    });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update order status (Employee/Admin only)
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'EMPLOYEE' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const { id } = req.params;
    const { status, trackingNumber } = req.body;
    
    // Get current order status before update
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } }
      }
    });
    
    if (!currentOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    const oldStatus = currentOrder.status;
    
    const order = await prisma.order.update({
      where: { id },
      data: { 
        status: status,
        trackingNumber: trackingNumber || undefined
      },
      include: {
        user: { select: { name: true, email: true } }
      }
    });
    
    // Send status update email only if status actually changed
    if (oldStatus !== status) {
      try {
        await emailService.sendEmail({
          to: order.user.email,
          subject: orderStatusUpdateEmail(order.user.name, order.orderNumber, oldStatus, status).subject,
          html: orderStatusUpdateEmail(order.user.name, order.orderNumber, oldStatus, status).html
        });
        console.log(`Status update email sent to ${order.user.email} for order ${order.orderNumber}`);
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError.message);
      }
    }
    
    res.json({ success: true, order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;