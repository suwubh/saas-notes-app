const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { handleAsync, NotFoundError, AuthorizationError, ConflictError } = require('../utils/errors');
const Tenant = require('../models/Tenant');

const router = express.Router();

router.use(authenticate);

router.post('/:slug/upgrade', requireRole(['admin']), handleAsync(async (req, res) => {
  const { slug } = req.params;

  const tenant = await Tenant.findBySlug(slug);
  if (!tenant) {
    throw new NotFoundError('Tenant not found');
  }

  if (req.user.tenant_id !== tenant.id) {
    throw new AuthorizationError('You can only upgrade your own organization');
  }

  if (tenant.subscription_plan === 'pro') {
    throw new ConflictError('Organization is already on Pro plan');
  }

  const updatedTenant = await Tenant.updateSubscription(tenant.id, 'pro');
  const notesCount = await Tenant.getNotesCount(tenant.id);

  res.json({
    success: true,
    message: 'Successfully upgraded to Pro plan! Note limits have been removed.',
    tenant: {
      id: updatedTenant.id,
      name: updatedTenant.name,
      slug: updatedTenant.slug,
      subscription_plan: updatedTenant.subscription_plan,
      notes_count: notesCount,
      notes_limit: null
    }
  });
}));

router.get('/:slug/stats', requireRole(['admin']), handleAsync(async (req, res) => {
  const { slug } = req.params;

  const tenant = await Tenant.findBySlug(slug);
  if (!tenant) {
    throw new NotFoundError('Tenant not found');
  }

  if (req.user.tenant_id !== tenant.id) {
    throw new AuthorizationError('Access denied');
  }

  const notesCount = await Tenant.getNotesCount(tenant.id);

  res.json({
    success: true,
    stats: {
      tenant: {
        name: tenant.name,
        slug: tenant.slug,
        subscription_plan: tenant.subscription_plan,
        created_at: tenant.created_at
      },
      notes_count: notesCount,
      notes_limit: tenant.subscription_plan === 'free' ? 3 : 'unlimited',
      can_upgrade: tenant.subscription_plan === 'free'
    }
  });
}));

module.exports = router;
