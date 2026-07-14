const express = require('express');
const { googleRedirect } = require('../controllers/authController');

const router = express.Router();

router.get('/google', googleRedirect);

module.exports = router;
