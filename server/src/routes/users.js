const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateMeRules, getUserRules } = require('../middleware/userValidators');
const { getMe, updateMe, getUser, deleteMe } = require('../controllers/userController');

router.get('/me', auth, getMe);
router.put('/me', auth, updateMeRules, validate, updateMe);
router.delete('/me', auth, deleteMe);
router.get('/:id', getUserRules, validate, getUser);

module.exports = router;
