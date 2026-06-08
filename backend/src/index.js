const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const { PrismaClient } = require('@prisma/client');

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();

// ============ CORS Configuration for Production ============
const allowedOrigins = [
  'http://localhost:5173',           // Local development
  'http://localhost:3000',           // Alternative dev port
  'https://mysecretdrawer.com',      // Production domain
  'https://www.mysecretdrawer.com',  // Production with www
  process.env.FRONTEND_URL           // From environment variable
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Security Middleware
app.use(helmet({ 
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', async (req, res) => {
  let dbStatus = 'unknown';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'disconnected';
  }
  
  res.json({ 
    status: 'OK', 
    message: 'My Secret Drawer API running', 
    timestamp: new Date().toISOString(),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const saleRoutes = require('./routes/saleRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const refundRoutes = require('./routes/refundRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api', uploadRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  const status = err.status || 500;
  res.status(status).json({ 
    success: false, 
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message 
  });
});

// Test database connection on startup
const testDatabaseConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(`✅ Database: CONNECTED`);
    const dbUrl = process.env.DATABASE_URL || '';
    const host = dbUrl.split('@')[1]?.split('/')[0] || 'unknown';
    console.log(`   📍 Host: ${host}`);
  } catch (error) {
    console.log(`❌ Database: DISCONNECTED`);
    console.log(`   ⚠️ Please check your DATABASE_URL`);
  }
};

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`═══════════════════════════════════════════════════`);
  console.log(`🚀 My Secret Drawer API Server`);
  console.log(`═══════════════════════════════════════════════════`);
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS Allowed Origins: ${allowedOrigins.join(', ')}`);
  
  await testDatabaseConnection();
  
  console.log(`═══════════════════════════════════════════════════`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET    /api/health      - Health check`);
  console.log(`   POST   /api/auth/login  - User login`);
  console.log(`   POST   /api/auth/register - User registration`);
  console.log(`   GET    /api/products    - Get products`);
  console.log(`═══════════════════════════════════════════════════`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log(`\n🛑 Shutting down server...`);
  await prisma.$disconnect();
  console.log(`✅ Database disconnected`);
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log(`\n🛑 Shutting down server...`);
  await prisma.$disconnect();
  console.log(`✅ Database disconnected`);
  process.exit(0);
});