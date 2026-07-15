const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const requireAuth = require('../middleware/auth');

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (['image/jpeg','image/png','image/webp'].includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only jpg, png, webp allowed'));
  },
});

// POST /api/v1/uploads/image
router.post('/image', requireAuth, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: { code: 'UPLOAD_ERROR', message: err.message } });
    if (!req.file) return res.status(400).json({ error: { code: 'NO_FILE', message: 'No image provided' } });

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'skillswap', resource_type: 'image' },
      (error, result) => {
        if (error) return next(error);
        res.json({ url: result.secure_url });
      }
    );
    stream.end(req.file.buffer);
  });
});

module.exports = router;
