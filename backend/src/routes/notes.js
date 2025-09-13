const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { extractTenant, requireTenant } = require('../middleware/tenant');
const { validateNote } = require('../middleware/validation');
const { handleAsync, NotFoundError, AuthorizationError, ConflictError } = require('../utils/errors');
const Note = require('../models/Note');
const Tenant = require('../models/Tenant');

const router = express.Router();

router.use(authenticate);
router.use(extractTenant);
router.use(requireTenant);


router.post('/', validateNote, handleAsync(async (req, res) => {
  const { title, content } = req.body;

  const tenant = await Tenant.findById(req.user.tenant_id);
  if (tenant.subscription_plan === 'free') {
    const notesCount = await Note.countByTenant(req.user.tenant_id);
    if (notesCount >= 3) {
      throw new ConflictError('Free plan limited to 3 notes. Upgrade to Pro for unlimited notes.');
    }
  }

  const note = await Note.create({
    tenantId: req.user.tenant_id,
    userId: req.user.id,
    title: title.trim(),
    content: content.trim()
  });

  res.status(201).json({
    success: true,
    note,
    message: 'Note created successfully'
  });
}));


router.get('/', handleAsync(async (req, res) => {
  const tenant = await Tenant.findById(req.user.tenant_id);
  
  
  const notes = await Note.findByTenant(
    req.user.tenant_id, 
    req.user.role === 'admin' ? null : req.user.id,
    req.user.role
  );

  res.json({
    success: true,
    notes,
    count: notes.length,
    tenant_info: {
      name: tenant.name,
      subscription_plan: tenant.subscription_plan,
      notes_limit: tenant.subscription_plan === 'free' ? 3 : null
    },
    viewing: req.user.role === 'admin' ? 'All tenant notes' : 'Your notes only'
  });
}));


router.get('/:id', handleAsync(async (req, res) => {
  const { id } = req.params;
  
  const note = await Note.findById(
    id, 
    req.user.tenant_id, 
    req.user.role === 'admin' ? null : req.user.id,
    req.user.role
  );

  if (!note) {
    throw new NotFoundError('Note not found or access denied');
  }

  res.json({
    success: true,
    note
  });
}));


router.put('/:id', validateNote, handleAsync(async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  const note = await Note.update(
    id, 
    req.user.tenant_id,
    req.user.id, 
    {
      title: title.trim(),
      content: content.trim()
    },
    req.user.role
  );

  if (!note) {
    throw new NotFoundError('Note not found or access denied');
  }

  res.json({
    success: true,
    note,
    message: 'Note updated successfully'
  });
}));


router.delete('/:id', handleAsync(async (req, res) => {
  const { id } = req.params;

  const note = await Note.delete(
    id, 
    req.user.tenant_id,
    req.user.id,
    req.user.role
  );

  if (!note) {
    throw new NotFoundError('Note not found or access denied');
  }

  res.json({
    success: true,
    message: 'Note deleted successfully',
    deleted_note: {
      id: note.id,
      title: note.title
    }
  });
}));

module.exports = router;
