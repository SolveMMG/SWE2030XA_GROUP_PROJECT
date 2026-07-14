const { param, body } = require('express-validator');

const uuidParam = param('id')
  .isUUID()
  .withMessage('User id must be a valid UUID');

const updateMeRules = [
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .trim()
    .notEmpty()
    .withMessage('Name cannot be blank')
    .isLength({ max: 255 })
    .withMessage('Name must be 255 characters or fewer'),

  body('bio')
    .optional({ nullable: true })
    .isString()
    .withMessage('Bio must be a string'),

  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array')
    .custom((arr) => arr.every((s) => typeof s === 'string'))
    .withMessage('Each skill must be a string'),

  body('photo_url')
    .optional({ nullable: true })
    .isURL()
    .withMessage('photo_url must be a valid URL'),
];

const getUserRules = [uuidParam];

module.exports = { updateMeRules, getUserRules };
