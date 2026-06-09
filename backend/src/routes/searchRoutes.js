const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to get user role from token
const getUserRole = async (token) => {
  if (!token) return 'GUEST';
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });
    return user?.role || 'GUEST';
  } catch (error) {
    return 'GUEST';
  }
};

// Unified search endpoint
router.get('/', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    // Return empty if search term is too short
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, results: [], userRole: 'GUEST' });
    }
    
    const searchTerm = q.trim();
    
    // Get user role from token if present
    const token = req.headers.authorization?.split(' ')[1];
    const userRole = await getUserRole(token);
    
    let results = [];
    
    // CASE 1: GUEST or CUSTOMER - Search PRODUCTS only
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
      
      results = products.map(product => ({
        id: product.id,
        type: 'product',
        title: product.name,
        description: product.description?.substring(0, 100) || '',
        category: product.category,
        price: product.price,
        salePrice: product.salePrice,
        stock: product.stock,
        image: product.images?.[0] || null,
        link: `/product/${product.id}`
      }));
    }
    
    // CASE 2: ADMIN or EMPLOYEE - Search ORDERS only
    else if (userRole === 'ADMIN' || userRole === 'EMPLOYEE') {
      const orders = await prisma.order.findMany({
        where: {
          OR: [
            { orderNumber: { contains: searchTerm, mode: 'insensitive' } },
            { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
            { user: { email: { contains: searchTerm, mode: 'insensitive' } } },
            { status: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
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
            take: 2,
            include: {
              product: {
                select: { name: true, images: true }
              }
            }
          }
        }
      });
      
      results = orders.map(order => ({
        id: order.id,
        type: 'order',
        orderNumber: order.orderNumber,
        customerName: order.user?.name || 'Guest',
        customerEmail: order.user?.email,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        itemCount: order.items.length,
        link: userRole === 'ADMIN' ? `/admin/orders/${order.id}` : `/employee/orders/${order.id}`
      }));
    }
    
    res.json({ 
      success: true, 
      results, 
      userRole,
      searchTerm 
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Search failed. Please try again.',
      error: error.message 
    });
  }
});

module.exports = router;