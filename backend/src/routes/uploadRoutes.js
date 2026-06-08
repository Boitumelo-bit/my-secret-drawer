const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

// Upload single image (Employee/Admin only)
router.post('/upload', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Convert buffer to base64
    const base64String = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64String}`;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'my_secret_drawer/products',
      transformation: [{ width: 500, height: 500, crop: 'limit' }]
    });
    
    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload multiple images (Employee/Admin only)
router.post('/upload-multiple', authenticate, requireRole(['EMPLOYEE', 'ADMIN']), upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    
    const uploadPromises = req.files.map(async (file) => {
      const base64String = file.buffer.toString('base64');
      const dataURI = `data:${file.mimetype};base64,${base64String}`;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'my_secret_drawer/products'
      });
      return result.secure_url;
    });
    
    const urls = await Promise.all(uploadPromises);
    res.json({ success: true, urls });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;