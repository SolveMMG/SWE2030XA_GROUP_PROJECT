const userModel = require('../models/userModel');

const ALLOWED_UPDATE_FIELDS = ['name', 'bio', 'skills', 'photo_url'];

const getMe = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    }
    return res.json(user);
  } catch (err) {
    return next(err);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const updates = {};
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'No valid fields provided' } });
    }

    const user = await userModel.updateById(req.user.id, updates);
    if (!user) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    }
    return res.json(user);
  } catch (err) {
    return next(err);
  }
};

module.exports = { getMe, updateMe };
