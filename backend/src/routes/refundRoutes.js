const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all refunds (Employee/Admin only)
router.get('/', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const refunds = await prisma.refund.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            orderNumber: true,
            user: { select: { name: true, email: true } }
          }
        }
      }
    });
    res.json({ success: true, refunds });
  } catch (error) {
    console.error('Fetch refunds error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get refund by ID
router.get('/:id', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const refund = await prisma.refund.findUnique({
      where: { id: req.params.id },
      include: { order: true }
    });
    if (!refund) {
      return res.status(404).json({ success: false, message: 'Refund not found' });
    }
    res.json({ success: true, refund });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create refund (Employee/Admin only)
router.post('/', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const { orderId, orderNumber, customerName, customerEmail, amount, reason, notes } = req.body;
    
    // Check if refund already exists for this order
    const existingRefund = await prisma.refund.findFirst({
      where: { orderId }
    });
    
    if (existingRefund) {
      return res.status(400).json({ success: false, message: 'Refund already processed for this order' });
    }
    
    const refund = await prisma.refund.create({
      data: {
        orderId,
        orderNumber,
        customerName,
        customerEmail: customerEmail || null,
        amount: parseFloat(amount),
        reason,
        status: 'COMPLETED',
        processedBy: req.user.name,
        notes: notes || null
      }
    });
    
    // Optional: Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'REFUNDED' }
    });
    
    res.status(201).json({ success: true, refund });
  } catch (error) {
    console.error('Create refund error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update refund status
router.patch('/:id/status', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const refund = await prisma.refund.update({
      where: { id },
      data: { status }
    });
    
    res.json({ success: true, refund });
  } catch (error) {
    console.error('Update refund error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;