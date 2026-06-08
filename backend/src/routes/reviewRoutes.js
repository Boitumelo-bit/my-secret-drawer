const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ============ HELPER FUNCTIONS ============

// Update product rating and review count - THIS IS THE KEY FUNCTION
const updateProductRating = async (productId) => {
  console.log(`Updating rating for product: ${productId}`);
  
  const reviews = await prisma.review.findMany({
    where: { 
      productId: productId,
      isApproved: true 
    }
  });
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
  const reviewCount = reviews.length;
  
  console.log(`Found ${reviewCount} approved reviews, average rating: ${averageRating}`);
  
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: averageRating,
      reviewsCount: reviewCount
    }
  });
  
  return { averageRating, reviewCount };
};

// Create notification for user
const createNotification = async (userId, title, message, type, metadata = {}) => {
  await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      metadata
    }
  });
};

// ============ CUSTOMER ROUTES ============

// Get product reviews (Public - approved only)
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { 
        productId,
        isApproved: true 
      },
      include: {
        user: {
          select: {
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create review (Customer only)
router.post('/', authenticate, async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId
        }
      }
    });
    
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }
    
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true }
    });
    
    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        productId,
        rating: parseInt(rating),
        title: title || null,
        comment: comment || null,
        isApproved: false
      }
    });
    
    await createNotification(
      req.user.id,
      'Review Submitted',
      `Your review for "${product.name}" has been submitted and is pending approval.`,
      'PROMOTION',
      { reviewId: review.id, productId, productName: product.name }
    );
    
    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get my reviews (Customer)
router.get('/my-reviews', authenticate, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: req.user.id },
      include: { product: { select: { name: true, images: true, price: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update my review (Customer)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;
    
    const review = await prisma.review.findFirst({
      where: { id, userId: req.user.id },
      include: { product: { select: { name: true } } }
    });
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        rating: rating || undefined,
        title: title || undefined,
        comment: comment || undefined,
        isApproved: false
      }
    });
    
    // Update product rating after update (since it becomes pending again)
    await updateProductRating(review.productId);
    
    await createNotification(
      req.user.id,
      'Review Updated',
      `Your review for "${review.product.name}" has been updated and needs re-approval.`,
      'PROMOTION',
      { reviewId: id, productId: review.productId }
    );
    
    res.json({ success: true, review: updatedReview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete my review (Customer)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await prisma.review.findFirst({
      where: { id, userId: req.user.id }
    });
    
    if (review) {
      await prisma.review.delete({ where: { id } });
      await updateProductRating(review.productId);
    }
    
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ EMPLOYEE/ADMIN ROUTES ============

// Get all reviews (Employee/Admin only)
router.get('/all', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, images: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, reviews });
  } catch (error) {
    console.error('Fetch all reviews error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get reviews by status (Employee/Admin only)
router.get('/status/:status', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const { status } = req.params;
    const isApproved = status === 'approved';
    
    const reviews = await prisma.review.findMany({
      where: { isApproved },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, images: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve review (Employee/Admin only) - THIS WILL UPDATE PRODUCT RATING
router.patch('/:id/approve', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingReview = await prisma.review.findUnique({
      where: { id },
      include: { user: true, product: { select: { name: true, id: true } } }
    });
    
    if (!existingReview) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    const review = await prisma.review.update({
      where: { id },
      data: { isApproved: true },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true } }
      }
    });
    
    // CRITICAL: Update product rating after approval
    await updateProductRating(existingReview.productId);
    
    await createNotification(
      existingReview.userId,
      'Your Review has been Approved!',
      `Your review for "${existingReview.product.name}" has been approved and is now visible on our website.`,
      'PROMOTION',
      { reviewId: id, productId: existingReview.productId, productName: existingReview.product.name }
    );
    
    res.json({ success: true, review });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ REPLY FUNCTIONALITY ============

// Add reply to review (Employee/Admin only)
router.post('/:id/reply', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    
    if (!reply || !reply.trim()) {
      return res.status(400).json({ success: false, message: 'Reply cannot be empty' });
    }
    
    const existingReview = await prisma.review.findUnique({
      where: { id },
      include: { user: true, product: { select: { name: true, id: true } } }
    });
    
    if (!existingReview) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    const review = await prisma.review.update({
      where: { id },
      data: { 
        reply: reply.trim(),
        isApproved: true 
      },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true } }
      }
    });
    
    // Update product rating
    await updateProductRating(existingReview.productId);
    
    await createNotification(
      existingReview.userId,
      'Reply to Your Review',
      `Store replied to your review on "${existingReview.product.name}"`,
      'PROMOTION',
      { 
        reviewId: id, 
        productId: existingReview.productId, 
        productName: existingReview.product.name,
        reply: reply.trim()
      }
    );
    
    res.json({ success: true, review });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update reply (Employee/Admin only)
router.put('/:id/reply', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    
    if (!reply || !reply.trim()) {
      return res.status(400).json({ success: false, message: 'Reply cannot be empty' });
    }
    
    const review = await prisma.review.update({
      where: { id },
      data: { reply: reply.trim() }
    });
    
    res.json({ success: true, review });
  } catch (error) {
    console.error('Update reply error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete reply (Employee/Admin only)
router.delete('/:id/reply', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await prisma.review.update({
      where: { id },
      data: { reply: null }
    });
    
    res.json({ success: true, review });
  } catch (error) {
    console.error('Delete reply error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reject/Delete review (Employee/Admin only)
router.delete('/:id/reject', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await prisma.review.findUnique({
      where: { id },
      include: { user: true, product: { select: { name: true, id: true } } }
    });
    
    if (review) {
      await prisma.review.delete({ where: { id } });
      await updateProductRating(review.productId);
      
      await createNotification(
        review.userId,
        'Review Not Approved',
        `Your review for "${review.product.name}" was not approved. Please contact support if you have questions.`,
        'ALERT',
        { reviewId: id, productId: review.productId, productName: review.product.name }
      );
    }
    
    res.json({ success: true, message: 'Review rejected and deleted' });
  } catch (error) {
    console.error('Reject review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get review statistics (Employee/Admin only)
router.get('/stats', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), async (req, res) => {
  try {
    const [total, pending, approved, averageRating] = await Promise.all([
      prisma.review.count(),
      prisma.review.count({ where: { isApproved: false } }),
      prisma.review.count({ where: { isApproved: true } }),
      prisma.review.aggregate({ _avg: { rating: true } })
    ]);
    
    res.json({
      success: true,
      stats: {
        total,
        pending,
        approved,
        averageRating: averageRating._avg.rating || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;