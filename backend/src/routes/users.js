const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { handleAsync, ValidationError } = require('../utils/errors');
const User = require('../models/User');

const router = express.Router();

router.use(authenticate);

router.post('/invite', requireRole(['admin']), handleAsync(async (req, res) => {
  const { email, role = 'member' } = req.body;

  if (!email) {
    throw new ValidationError('Email is required');
  }

  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const user = await User.create({
    tenantId: req.user.tenant_id,
    email,
    password: 'defaultpassword',
    role
  });

  res.status(201).json({
    success: true,
    message: 'User invited successfully',
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  });
}));

module.exports = router;
