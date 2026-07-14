const express = require('express');
const { googleRedirect, googleCallback } = require('../controllers/authController');

const router = express.Router();

router.get('/google', googleRedirect);
router.get('/google/callback', googleCallback);

module.exports = router;
