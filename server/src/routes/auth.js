const express = require('express');
const { googleRedirect, googleCallback, refreshAccessToken } = require('../controllers/authController');

const router = express.Router();

router.get('/google', googleRedirect);
router.get('/google/callback', googleCallback);
router.post('/refresh', refreshAccessToken);

module.exports = router;
