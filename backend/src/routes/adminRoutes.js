const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();

// Custom auth middleware for admin routes
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true, isActive: true }
    });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid or inactive account' });
    }
    
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. ${user.role} role does not have permission for this action.` 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// ==================== USER MANAGEMENT ====================
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
        orders: {
          select: {
            total: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const usersWithStats = users.map(user => ({
      ...user,
      orderCount: user.orders.length,
      totalSpent: user.orders.reduce((sum, order) => sum + order.total, 0)
    }));
    
    res.json({ success: true, users: usersWithStats });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: { orderBy: { createdAt: 'desc' }, take: 10 },
        addresses: true,
        reviews: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/users/:id/role', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const validRoles = ['CUSTOMER', 'EMPLOYEE', 'ADMIN'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/users/:id/toggle-status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = await prisma.user.findUnique({ where: { id } });
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: { isActive: !currentUser.isActive },
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ORDER MANAGEMENT ====================
router.get('/orders/all', authenticateAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true, price: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/orders/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, addresses: true }
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true, price: true, category: true }
            }
          }
        },
        payment: true,
        refunds: true
      }
    });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/orders/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { email: true, name: true } }
      }
    });
    
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== AUDIT LOGS ====================
router.get('/audit-logs', authenticateAdmin, async (req, res) => {
  try {
    const { action, userId, startDate, endDate, page = 1, limit = 50 } = req.query;
    
    const where = {};
    if (action) where.action = action;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    
    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });
    
    const total = await prisma.auditLog.count({ where });
    
    res.json({
      success: true,
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/audit-logs/actions', authenticateAdmin, async (req, res) => {
  try {
    const actions = await prisma.auditLog.groupBy({
      by: ['action'],
      _count: {
        action: true
      }
    });
    
    res.json({ success: true, actions });
  } catch (error) {
    console.error('Error fetching actions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;