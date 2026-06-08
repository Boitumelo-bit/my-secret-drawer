const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user's cart
router.get('/', authenticate, async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true }
    });
    
    // Format cart items
    const formattedCart = cartItems.map(item => ({
      id: item.product.id,
      cartItemId: item.id,
      name: item.product.name,
      price: item.product.price,
      priceLSL: item.product.priceLSL,
      priceZAR: item.product.priceZAR,
      image: item.product.images?.[0] || '',
      quantity: item.quantity,
      selectedSize: item.size,
      selectedColor: item.color,
      stock: item.product.stock
    }));
    
    res.json({ success: true, cart: formattedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add to cart
router.post('/add', authenticate, async (req, res) => {
  try {
    const { productId, size, color, quantity = 1 } = req.body;
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: req.user.id,
        productId,
        size: size || null,
        color: color || null
      }
    });
    
    if (existingItem) {
      // Update quantity
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
      
      return res.json({ success: true, message: 'Cart updated', item: updatedItem });
    }
    
    // Create new cart item
    const cartItem = await prisma.cartItem.create({
      data: {
        userId: req.user.id,
        productId,
        size: size || null,
        color: color || null,
        quantity
      }
    });
    
    res.json({ success: true, message: 'Added to cart', item: cartItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update cart item quantity
router.put('/update/:cartItemId', authenticate, async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    
    if (quantity < 1) {
      // Remove item if quantity is 0
      await prisma.cartItem.delete({
        where: { id: cartItemId, userId: req.user.id }
      });
      return res.json({ success: true, message: 'Item removed' });
    }
    
    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItemId, userId: req.user.id },
      data: { quantity }
    });
    
    res.json({ success: true, message: 'Cart updated', item: updatedItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove item from cart
router.delete('/remove/:cartItemId', authenticate, async (req, res) => {
  try {
    await prisma.cartItem.delete({
      where: { id: req.params.cartItemId, userId: req.user.id }
    });
    
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Clear cart
router.delete('/clear', authenticate, async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id }
    });
    
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;