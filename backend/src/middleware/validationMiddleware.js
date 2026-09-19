import { body, validationResult } from 'express-validator';

export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
}

export const authValidation = {
  register: [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').trim().isEmail().withMessage('Valid email address is required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    handleValidationErrors
  ],
  login: [
    body('email').trim().notEmpty().withMessage('Email is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
    handleValidationErrors
  ],
  requestReset: [
    body('email').trim().isEmail().withMessage('Valid email is required.'),
    handleValidationErrors
  ],
  resetPassword: [
    body('token').notEmpty().withMessage('Token is required.'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    handleValidationErrors
  ]
};

export const recipientValidation = {
  createOrUpdate: [
    body('name').trim().notEmpty().withMessage('Recipient name is required.'),
    body('relationship').optional().trim(),
    body('description').optional().trim(),
    body('age').optional().trim(),
    body('budget').optional().trim(),
    body('occasion').optional().trim(),
    handleValidationErrors
  ]
};

export const giftValidation = {
  save: [
    body('name').trim().notEmpty().withMessage('Gift name is required.'),
    body('price_range').optional().trim(),
    body('category').optional().trim(),
    body('status').optional().isIn(['suggested', 'saved', 'bought', 'archived']).withMessage('Invalid status'),
    handleValidationErrors
  ],
  updateStatus: [
    body('status').isIn(['suggested', 'saved', 'bought', 'archived']).withMessage('Invalid status'),
    handleValidationErrors
  ],
  feedback: [
    body('is_positive').isBoolean().withMessage('is_positive must be a boolean'),
    handleValidationErrors
  ]
};
