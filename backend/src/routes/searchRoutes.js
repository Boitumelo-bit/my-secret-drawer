const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Unified search endpoint - behavior changes based on user role
router.get('/', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, results: [] });
    }
    
    const searchTerm = q.trim();
    
    // Check authentication and role
    let userRole = 'GUEST';
    
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { role: true }
        });
        if (user) {
          userRole = user.role;
        }
      } catch (e) {
        // Invalid token, treat as guest
      }
    }
    
    let results = [];
    
    // GUEST or CUSTOMER: Search PRODUCTS only
    if (userRole === 'GUEST' || userRole === 'CUSTOMER') {
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { category: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { sale: true }
      });
      
      results = products.map(p => ({
        id: p.id,
        type: 'product',
        title: p.name,
        description: p.description?.substring(0, 100),
        category: p.category,
        price: p.price,
        salePrice: p.salePrice,
        stock: p.stock,
        image: p.images?.[0] || null,
        link: `/product/${p.id}`
      }));
    }
    
    // ADMIN or EMPLOYEE: Search ORDERS only
    else if (userRole === 'ADMIN' || userRole === 'EMPLOYEE') {
      const orders = await prisma.order.findMany({
        where: {
          OR: [
            { orderNumber: { contains: searchTerm, mode: 'insensitive' } },
            { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
            { user: { email: { contains: searchTerm, mode: 'insensitive' } } },
            { status: { equals: searchTerm.toUpperCase() } }
          ]
        },
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          },
          items: {
            take: 2
          }
        }
      });
      
      results = orders.map(o => ({
        id: o.id,
        type: 'order',
        orderNumber: o.orderNumber,
        customerName: o.user?.name || 'Guest',
        customerEmail: o.user?.email,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
        link: userRole === 'ADMIN' ? `/admin/orders/${o.id}` : `/employee/orders/${o.id}`
      }));
    }
    
    res.json({ success: true, results, userRole });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;