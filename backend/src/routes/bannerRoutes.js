const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all banners (Employee/Admin only)
router.get('/', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' }
    });
    res.json({ success: true, banners });
  } catch (error) {
    console.error('Fetch banners error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get active banners for homepage (Public)
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } }
        ],
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      },
      orderBy: { order: 'asc' }
    });
    res.json({ success: true, banners });
  } catch (error) {
    console.error('Fetch active banners error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single banner
router.get('/:id', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const banner = await prisma.banner.findUnique({
      where: { id: req.params.id }
    });
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    res.json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create banner (Employee/Admin only)
router.post('/', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const { title, subtitle, image, link, position, order, isActive, startDate, endDate } = req.body;
    
    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle: subtitle || '',
        image,
        link: link || '',
        position: position || 'home_hero',
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    });
    
    res.status(201).json({ success: true, banner });
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update banner (Employee/Admin only)
router.put('/:id', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, image, link, position, order, isActive, startDate, endDate } = req.body;
    
    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title,
        subtitle: subtitle || '',
        image,
        link: link || '',
        position: position || 'home_hero',
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    });
    
    res.json({ success: true, banner });
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete banner (Employee/Admin only)
router.delete('/:id', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.banner.delete({
      where: { id }
    });
    
    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;