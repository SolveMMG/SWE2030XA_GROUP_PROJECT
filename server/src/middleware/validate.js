const { validationResult } = require('express-validator');

<<<<<<< HEAD
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      },
    });
  }
  return next();
};
=======
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: errors.array()[0].msg }
    });
  }
  next();
}
>>>>>>> 2eedb49 (feat: implement authentication and authorization middleware)

module.exports = validate;
