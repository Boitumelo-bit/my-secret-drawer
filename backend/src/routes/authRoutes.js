const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { createAuditLog } = require('../utils/auditLogger');

const router = express.Router();
const prisma = new PrismaClient();

// Customer Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        role: 'CUSTOMER'
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    await createAuditLog(
      user.id,
      'USER_REGISTER',
      { email: user.email, role: user.role },
      req.ip,
      req.headers['user-agent']
    );
    
    res.status(201).json({ success: true, user, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account deactivated' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    let redirect = '/dashboard';
    if (user.role === 'EMPLOYEE') redirect = '/employee/dashboard';
    if (user.role === 'ADMIN') redirect = '/admin/dashboard';
    
    await createAuditLog(
      user.id,
      'USER_LOGIN',
      { email: user.email, role: user.role, redirect },
      req.ip,
      req.headers['user-agent']
    );
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      },
      token,
      redirect
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get current user (protected)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true, avatar: true, isActive: true, phone: true, createdAt: true }
    });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Update user profile (protected)
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name, phone, avatar } = req.body;
    
    const oldUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { name: true, phone: true, avatar: true }
    });
    
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: { 
        name: name || undefined,
        phone: phone || undefined,
        avatar: avatar || undefined
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
        isActive: true
      }
    });
    
    await createAuditLog(
      decoded.userId,
      'UPDATE_PROFILE',
      { 
        old: { name: oldUser.name, phone: oldUser.phone },
        new: { name: updatedUser.name, phone: updatedUser.phone }
      },
      req.ip,
      req.headers['user-agent']
    );
    
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all customers (Admin/Employee only)
router.get('/admin/customers', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true, isActive: true }
    });
    
    if (!currentUser || !currentUser.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }
    
    if (currentUser.role !== 'EMPLOYEE' && currentUser.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
        _count: {
          select: { orders: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    await createAuditLog(
      decoded.userId,
      'VIEW_CUSTOMERS',
      { totalCustomers: customers.length },
      req.ip,
      req.headers['user-agent']
    );
    
    res.json({ success: true, customers });
  } catch (error) {
    console.error('Fetch customers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ FIREBASE SYNC ENDPOINT (ADD THIS) ============
router.post('/firebase-sync', async (req, res) => {
  try {
    const { uid, email, name, photoURL, provider } = req.body;
    
    if (!uid || !email) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    // Check if user already exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { firebaseUid: uid },
          { email: email }
        ]
      }
    });
    
    if (user) {
      if (!user.firebaseUid) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            firebaseUid: uid,
            lastLogin: new Date(),
            avatar: photoURL || user.avatar
          }
        });
      } else {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() }
        });
      }
      
      await createAuditLog(
        user.id,
        'FIREBASE_LOGIN',
        { email: user.email, provider: provider, firebaseUid: uid },
        req.ip,
        req.headers['user-agent']
      );
    } else {
      user = await prisma.user.create({
        data: {
          firebaseUid: uid,
          email: email,
          name: name || email.split('@')[0],
          avatar: photoURL || null,
          role: 'CUSTOMER',
          isActive: true,
          createdAt: new Date(),
          lastLogin: new Date()
        }
      });
      
      await createAuditLog(
        user.id,
        'FIREBASE_REGISTER',
        { email: user.email, provider: provider, firebaseUid: uid },
        req.ip,
        req.headers['user-agent']
      );
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const { password, ...userWithoutPassword } = user;
    
    let redirect = '/dashboard';
    if (user.role === 'EMPLOYEE') redirect = '/employee/dashboard';
    if (user.role === 'ADMIN') redirect = '/admin/dashboard';
    
    res.json({
      success: true,
      user: userWithoutPassword,
      token,
      redirect
    });
  } catch (error) {
    console.error('Firebase sync error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;