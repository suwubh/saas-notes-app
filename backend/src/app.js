const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const tenantsRoutes = require('./routes/tenants');
const usersRoutes = require('./routes/users');
const { AppError } = require('./utils/errors');
const app = express();
const PORT = process.env.PORT || 3001;
app.use(helmet());
app.use(cors({
  origin: [
    'https://saas-notes-app-frontend.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    /\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Slug']
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});
app.get('/', (req, res) => {
  res.json({ 
    message: 'SaaS Notes API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: {
        login: 'POST /auth/login',
        signup: 'POST /auth/signup',
        me: 'GET /auth/me'
      },
      notes: {
        create: 'POST /notes',
        list: 'GET /notes',
        get: 'GET /notes/:id',
        update: 'PUT /notes/:id',
        delete: 'DELETE /notes/:id'
      },
      tenants: {
        upgrade: 'POST /tenants/:slug/upgrade',
        stats: 'GET /tenants/:slug/stats'
      },
      users: {
        invite: 'POST /users/invite'
      }
    },
    test_accounts: [
      'admin@acme.test (Admin, Acme)',
      'user@acme.test (Member, Acme)',
      'admin@globex.test (Admin, Globex)',
      'user@globex.test (Member, Globex)'
    ],
    note: 'All test accounts use password: "password"'
  });
});
app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);
app.use('/tenants', tenantsRoutes);
app.use('/users', usersRoutes);
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired'
    });
  }
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: 'Resource already exists'
    });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});
app.use('/:path(.*)', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    requested_path: req.originalUrl 
  });
});
app.listen(PORT, () => {
  console.log(`SaaS Notes API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API docs: http://localhost:${PORT}/`);
});
module.exports = app;
