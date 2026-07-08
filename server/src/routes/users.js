const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMe, updateMe, getUser, deleteMe } = require('../controllers/userController');

router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);
router.delete('/me', auth, deleteMe);
router.get('/:id', getUser);

module.exports = router;
