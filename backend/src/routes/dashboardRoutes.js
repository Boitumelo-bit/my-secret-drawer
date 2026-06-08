const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true, isActive: true }
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

// Customer Dashboard
router.get('/customer', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'CUSTOMER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } }
    });
    
    const wishlistCount = await prisma.wishlist.count({ where: { userId: req.user.id } });
    const addressesCount = await prisma.address.count({ where: { userId: req.user.id } });
    
    res.json({
      success: true,
      dashboard: {
        recentOrders: orders,
        wishlistCount,
        addressesCount,
        totalSpent: 0,
        totalOrders: orders.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Employee Dashboard
router.get('/employee', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'EMPLOYEE' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } });
    const totalOrders = await prisma.order.count();
    const lowStockProducts = await prisma.product.count({ where: { stock: { lt: 10 } } });
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    });
    
    res.json({
      success: true,
      dashboard: {
        stats: { pendingOrders, totalOrders, lowStockProducts },
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin Dashboard
router.get('/admin', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const totalUsers = await prisma.user.count();
    const totalCustomers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    const totalEmployees = await prisma.user.count({ where: { role: 'EMPLOYEE' } });
    const totalOrders = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({ _sum: { total: true } });
    const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } });
    const lowStock = await prisma.product.count({ where: { stock: { lt: 10 } } });
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    });
    
    res.json({
      success: true,
      dashboard: {
        stats: { totalUsers, totalCustomers, totalEmployees, totalOrders, totalRevenue: totalRevenue._sum.total || 0, pendingOrders, lowStock },
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;