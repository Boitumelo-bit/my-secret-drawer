const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to convert BigInt to Number
const serializeBigInt = (data) => {
  return JSON.parse(JSON.stringify(data, (key, value) => 
    typeof value === 'bigint' ? Number(value) : value
  ));
};

// Get dashboard analytics (Employee/Admin only)
router.get('/dashboard', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get all orders
    const allOrders = await prisma.order.findMany({
      include: {
        items: true,
        user: true
      }
    });

    // Calculate totals
    const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = allOrders.length;
    const totalCustomers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    const totalProducts = await prisma.product.count();
    const lowStockProducts = await prisma.product.count({ where: { stock: { lt: 10 } } });
    const outOfStockProducts = await prisma.product.count({ where: { stock: 0 } });

    // Monthly revenue
    const monthlyRevenue = allOrders
      .filter(o => new Date(o.createdAt) >= startOfMonth)
      .reduce((sum, o) => sum + o.total, 0);

    // Weekly revenue
    const weeklyRevenue = allOrders
      .filter(o => new Date(o.createdAt) >= startOfWeek)
      .reduce((sum, o) => sum + o.total, 0);

    // Yearly revenue
    const yearlyRevenue = allOrders
      .filter(o => new Date(o.createdAt) >= startOfYear)
      .reduce((sum, o) => sum + o.total, 0);

    // Average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Orders by status
    const ordersByStatus = {
      pending: allOrders.filter(o => o.status === 'PENDING').length,
      confirmed: allOrders.filter(o => o.status === 'CONFIRMED').length,
      packed: allOrders.filter(o => o.status === 'PACKED').length,
      shipped: allOrders.filter(o => o.status === 'SHIPPED').length,
      delivered: allOrders.filter(o => o.status === 'DELIVERED').length,
      cancelled: allOrders.filter(o => o.status === 'CANCELLED').length,
      refunded: allOrders.filter(o => o.status === 'REFUNDED').length
    };

    // Top selling products - FIXED: Convert BigInt to Number
    const topProductsRaw = await prisma.$queryRaw`
      SELECT 
        p.id, 
        p.name, 
        p.price, 
        p.images,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.price) as total_revenue
      FROM order_items oi
      JOIN products p ON oi."productId" = p.id
      JOIN orders o ON oi."orderId" = o.id
      WHERE o.status NOT IN ('CANCELLED', 'REFUNDED')
      GROUP BY p.id, p.name, p.price, p.images
      ORDER BY total_sold DESC
      LIMIT 10
    `;
    
    const topProducts = serializeBigInt(topProductsRaw);

    // Sales by category - FIXED: Convert BigInt to Number
    const salesByCategoryRaw = await prisma.$queryRaw`
      SELECT 
        p.category,
        COUNT(DISTINCT oi."orderId") as order_count,
        SUM(oi.quantity) as items_sold,
        SUM(oi.quantity * oi.price) as revenue
      FROM order_items oi
      JOIN products p ON oi."productId" = p.id
      JOIN orders o ON oi."orderId" = o.id
      WHERE o.status NOT IN ('CANCELLED', 'REFUNDED')
      GROUP BY p.category
      ORDER BY revenue DESC
    `;
    
    const salesByCategory = serializeBigInt(salesByCategoryRaw);

    // Monthly sales for chart (last 12 months) - FIXED: Convert BigInt to Number
    const monthlySalesRaw = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', o."createdAt") as month,
        COUNT(*) as order_count,
        SUM(o.total) as revenue
      FROM orders o
      WHERE o."createdAt" >= NOW() - INTERVAL '12 months'
        AND o.status NOT IN ('CANCELLED', 'REFUNDED')
      GROUP BY DATE_TRUNC('month', o."createdAt")
      ORDER BY month ASC
    `;
    
    const monthlySales = serializeBigInt(monthlySalesRaw);

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { take: 2 }
      }
    });

    // Customer growth over time - FIXED: Convert BigInt to Number
    const customerGrowthRaw = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', u."createdAt") as month,
        COUNT(*) as new_customers
      FROM users u
      WHERE u.role = 'CUSTOMER'
        AND u."createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', u."createdAt")
      ORDER BY month ASC
    `;
    
    const customerGrowth = serializeBigInt(customerGrowthRaw);

    // Conversion rate (orders / visitors) - approximate
    const conversionRate = totalCustomers > 0 ? (totalOrders / totalCustomers) * 100 : 0;

    res.json({
      success: true,
      analytics: {
        summary: {
          totalRevenue,
          totalOrders,
          totalCustomers,
          totalProducts,
          lowStockProducts,
          outOfStockProducts,
          monthlyRevenue,
          weeklyRevenue,
          yearlyRevenue,
          averageOrderValue,
          conversionRate: conversionRate.toFixed(2)
        },
        ordersByStatus,
        topProducts,
        salesByCategory,
        monthlySales,
        recentOrders,
        customerGrowth
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get sales by date range
router.get('/sales-by-date', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
    const end = endDate ? new Date(endDate) : new Date();

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { notIn: ['CANCELLED', 'REFUNDED'] }
      },
      include: { items: true }
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;

    res.json({
      success: true,
      data: {
        startDate: start,
        endDate: end,
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get product performance - FIXED: Convert BigInt to Number
router.get('/products', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const topProductsRaw = await prisma.$queryRaw`
      SELECT 
        p.id,
        p.name,
        p.price,
        p.stock,
        p.images,
        COALESCE(SUM(oi.quantity), 0) as total_sold,
        COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi."productId"
      LEFT JOIN orders o ON oi."orderId" = o.id AND o.status NOT IN ('CANCELLED', 'REFUNDED')
      GROUP BY p.id, p.name, p.price, p.stock, p.images
      ORDER BY total_sold DESC
      LIMIT 20
    `;
    
    const topProducts = serializeBigInt(topProductsRaw);

    res.json({ success: true, products: topProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;