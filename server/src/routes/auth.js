const express = require('express');
const {
  googleRedirect, googleCallback, refreshAccessToken, logout,
} = require('../controllers/authController');

const router = express.Router();

router.get('/google', googleRedirect);
router.get('/google/callback', googleCallback);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);

module.exports = router;
