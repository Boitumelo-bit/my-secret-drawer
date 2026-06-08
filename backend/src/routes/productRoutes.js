const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ============ PUBLIC ROUTES (Everyone can view) ============

// Get all products with sale price
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        sale: true  // Include sale information
      }
    });
    
    // Format products with sale price
    const formattedProducts = products.map(product => ({
      ...product,
      originalPrice: product.price,
      displayPrice: product.salePrice || product.price,
      isOnSale: !!(product.salePrice && product.salePrice < product.price)
    }));
    
    res.json({ success: true, products: formattedProducts });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single product with sale price
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { 
        reviews: { where: { isApproved: true }, take: 5 },
        sale: true
      }
    });
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    const formattedProduct = {
      ...product,
      originalPrice: product.price,
      displayPrice: product.salePrice || product.price,
      isOnSale: !!(product.salePrice && product.salePrice < product.price)
    };
    
    res.json({ success: true, product: formattedProduct });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ EMPLOYEE/ADMIN ROUTES (Product Management) ============

// Create new product (Employee/Admin only)
router.post('/admin/products', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const { name, description, price, priceLSL, priceZAR, category, stock, sizes, colors, images } = req.body;
    
    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        priceLSL: parseFloat(priceLSL || price),
        priceZAR: parseFloat(priceZAR || price),
        category,
        stock: parseInt(stock),
        sizes: sizes || [],
        colors: colors || [],
        images: images || [],
        isNew: true,
        isFeatured: false,
        salePrice: null,
        saleId: null
      }
    });
    
    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update product (Employee/Admin only)
router.put('/admin/products/:id', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, priceLSL, priceZAR, category, stock, sizes, colors, images, isNew, isFeatured } = req.body;
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description || undefined,
        price: price ? parseFloat(price) : undefined,
        priceLSL: priceLSL ? parseFloat(priceLSL) : undefined,
        priceZAR: priceZAR ? parseFloat(priceZAR) : undefined,
        category: category || undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        sizes: sizes || undefined,
        colors: colors || undefined,
        images: images || undefined,
        isNew: isNew !== undefined ? isNew : undefined,
        isFeatured: isFeatured !== undefined ? isFeatured : undefined
      }
    });
    
    res.json({ success: true, product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete product (Employee/Admin only)
router.delete('/admin/products/:id', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // First delete related order items
    await prisma.orderItem.deleteMany({
      where: { productId: id }
    });
    
    // Then delete the product
    await prisma.product.delete({
      where: { id }
    });
    
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update stock only (Employee/Admin only)
router.patch('/admin/products/:id/stock', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    
    const product = await prisma.product.update({
      where: { id },
      data: { stock: parseInt(stock) }
    });
    
    res.json({ success: true, product });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;