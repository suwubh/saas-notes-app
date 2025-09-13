const express = require('express');
const { generateToken } = require('../utils/jwt');
const { handleAsync, AuthenticationError, ValidationError, ConflictError, NotFoundError } = require('../utils/errors');
const { validateLogin } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

const router = express.Router();

router.post('/signup', handleAsync(async (req, res) => {
  const { email, password, tenantSlug } = req.body;

  if (!email || !password || !tenantSlug) {
    throw new ValidationError('Email, password and tenant are required');
  }

  const allowedTenants = ['acme', 'globex'];
  if (!allowedTenants.includes(tenantSlug.toLowerCase())) {
    throw new ValidationError('Invalid tenant selected');
  }

  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new ConflictError('User already exists');
  }

  const tenant = await Tenant.findBySlug(tenantSlug);
  if (!tenant) {
    throw new NotFoundError('Tenant not found');
  }

  const user = await User.create({
    tenantId: tenant.id,
    email,
    password,
    role: 'member'
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        subscription_plan: 'free'
      }
    }
  });
}));

router.post('/login', validateLogin, handleAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findByEmail(email.toLowerCase().trim());
  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  const isValidPassword = await User.validatePassword(password, user.password_hash);
  if (!isValidPassword) {
    throw new AuthenticationError('Invalid email or password');
  }

  const tenant = await Tenant.findById(user.tenant_id);
  if (!tenant) {
    throw new AuthenticationError('Account tenant not found');
  }

  const token = generateToken({
    userId: user.id,
    tenantId: user.tenant_id,
    email: user.email,
    role: user.role
  });

  const notesCount = await Tenant.getNotesCount(tenant.id);

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        subscription_plan: tenant.subscription_plan,
        notes_count: notesCount,
        notes_limit: tenant.subscription_plan === 'free' ? 3 : null
      }
    }
  });
}));

router.get('/me', authenticate, handleAsync(async (req, res) => {
  const tenant = await Tenant.findById(req.user.tenant_id);
  const notesCount = await Tenant.getNotesCount(req.user.tenant_id);

  res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        subscription_plan: tenant.subscription_plan,
        notes_count: notesCount,
        notes_limit: tenant.subscription_plan === 'free' ? 3 : null
      }
    }
  });
}));

module.exports = router;
