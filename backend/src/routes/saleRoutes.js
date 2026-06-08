const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to calculate sale price
const calculateSalePrice = (originalPrice, discountType, discountValue) => {
  if (discountType === 'percentage') {
    return parseFloat((originalPrice * (1 - discountValue / 100)).toFixed(2));
  } else {
    return parseFloat((originalPrice - discountValue).toFixed(2));
  }
};

// Get all sales
router.get('/', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create sale
router.post('/', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const { name, description, discountType, discountValue, startDate, endDate, applyToAll, selectedProducts } = req.body;
    
    const sale = await prisma.sale.create({
      data: {
        name,
        description: description || '',
        discountType,
        discountValue: parseFloat(discountValue),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        applyToAll: applyToAll || false,
        selectedProducts: selectedProducts || []
      }
    });
    
    // Update products with sale price
    if (applyToAll) {
      const allProducts = await prisma.product.findMany();
      for (const product of allProducts) {
        const salePrice = calculateSalePrice(product.price, discountType, parseFloat(discountValue));
        await prisma.product.update({
          where: { id: product.id },
          data: { saleId: sale.id, salePrice: salePrice }
        });
      }
    } else if (selectedProducts && selectedProducts.length > 0) {
      for (const productId of selectedProducts) {
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (product) {
          const salePrice = calculateSalePrice(product.price, discountType, parseFloat(discountValue));
          await prisma.product.update({
            where: { id: productId },
            data: { saleId: sale.id, salePrice: salePrice }
          });
        }
      }
    }
    
    res.status(201).json({ success: true, sale });
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update sale
router.put('/:id', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, discountType, discountValue, startDate, endDate, applyToAll, selectedProducts } = req.body;
    
    // Remove old sale from products
    await prisma.product.updateMany({
      where: { saleId: id },
      data: { saleId: null, salePrice: null }
    });
    
    const sale = await prisma.sale.update({
      where: { id },
      data: {
        name,
        description: description || '',
        discountType,
        discountValue: parseFloat(discountValue),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        applyToAll: applyToAll || false,
        selectedProducts: selectedProducts || []
      }
    });
    
    // Apply updated sale to products
    if (applyToAll) {
      const allProducts = await prisma.product.findMany();
      for (const product of allProducts) {
        const salePrice = calculateSalePrice(product.price, discountType, parseFloat(discountValue));
        await prisma.product.update({
          where: { id: product.id },
          data: { saleId: sale.id, salePrice: salePrice }
        });
      }
    } else if (selectedProducts && selectedProducts.length > 0) {
      for (const productId of selectedProducts) {
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (product) {
          const salePrice = calculateSalePrice(product.price, discountType, parseFloat(discountValue));
          await prisma.product.update({
            where: { id: productId },
            data: { saleId: sale.id, salePrice: salePrice }
          });
        }
      }
    }
    
    res.json({ success: true, sale });
  } catch (error) {
    console.error('Update sale error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete sale
router.delete('/:id', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Remove sale from products
    await prisma.product.updateMany({
      where: { saleId: id },
      data: { saleId: null, salePrice: null }
    });
    
    await prisma.sale.delete({ where: { id } });
    res.json({ success: true, message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get active sales
router.get('/active/all', async (req, res) => {
  try {
    const now = new Date();
    const activeSales = await prisma.sale.findMany({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
        isActive: true
      }
    });
    res.json({ success: true, sales: activeSales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;