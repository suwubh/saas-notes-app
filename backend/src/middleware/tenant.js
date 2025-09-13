const Tenant = require('../models/Tenant');

const extractTenant = async (req, res, next) => {
  try {
    const tenantSlug = req.params.slug || req.headers['x-tenant-slug'];
    
    if (!tenantSlug && req.user) {
      const tenant = await Tenant.findById(req.user.tenant_id);
      if (tenant) {
        req.tenant = tenant;
        return next();
      }
    }

    if (tenantSlug) {
      const tenant = await Tenant.findBySlug(tenantSlug);
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }
      req.tenant = tenant;
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const requireTenant = (req, res, next) => {
  if (!req.tenant) {
    return res.status(400).json({ error: 'Tenant context required' });
  }
  next();
};

module.exports = {
  extractTenant,
  requireTenant
};
