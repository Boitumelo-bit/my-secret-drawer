const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user's wishlist
router.get('/', authenticate, async (req, res) => {
  try {
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: { product: true }
    });
    
    const formattedWishlist = wishlistItems.map(item => ({
      id: item.product.id,
      wishlistId: item.id,
      name: item.product.name,
      price: item.product.price,
      priceLSL: item.product.priceLSL,
      priceZAR: item.product.priceZAR,
      image: item.product.images?.[0] || '',
      rating: item.product.rating,
      category: item.product.category
    }));
    
    res.json({ success: true, wishlist: formattedWishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add to wishlist
router.post('/add', authenticate, async (req, res) => {
  try {
    const { productId } = req.body;
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Check if already in wishlist
    const existing = await prisma.wishlist.findFirst({
      where: {
        userId: req.user.id,
        productId
      }
    });
    
    if (existing) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }
    
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: req.user.id,
        productId
      }
    });
    
    res.json({ success: true, message: 'Added to wishlist', item: wishlistItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove from wishlist
router.delete('/remove/:productId', authenticate, async (req, res) => {
  try {
    await prisma.wishlist.deleteMany({
      where: {
        userId: req.user.id,
        productId: req.params.productId
      }
    });
    
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check if product is in wishlist
router.get('/check/:productId', authenticate, async (req, res) => {
  try {
    const existing = await prisma.wishlist.findFirst({
      where: {
        userId: req.user.id,
        productId: req.params.productId
      }
    });
    
    res.json({ success: true, isInWishlist: !!existing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Clear wishlist
router.delete('/clear', authenticate, async (req, res) => {
  try {
    await prisma.wishlist.deleteMany({
      where: { userId: req.user.id }
    });
    
    res.json({ success: true, message: 'Wishlist cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;