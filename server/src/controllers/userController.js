const userModel = require('../models/userModel');

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

module.exports = { getMe };
