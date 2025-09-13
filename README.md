# Multi-Tenant SaaS Notes Application

A secure multi-tenant SaaS application for managing notes with role-based access control and subscription limits.

## Features
- Multi-tenancy using shared schema with tenant ID
- JWT-based authentication with Admin and Member roles
- Subscription plans: Free (3 notes) and Pro (unlimited)
- CRUD APIs with tenant isolation
- Frontend with React and TypeScript
- Deployed on Vercel (Frontend and Backend)

## Test Accounts
- admin@acme.test (Admin, Acme, Free)
- user@acme.test (Member, Acme, Free)
- admin@globex.test (Admin, Globex, Free)
- user@globex.test (Member, Globex, Free)

## API Endpoints
- POST /auth/login - Login and receive JWT
- POST /notes - Create note
- GET /notes - List notes of tenant
- PUT /notes/:id - Update note
- DELETE /notes/:id - Delete note
- POST /tenants/:slug/upgrade - Upgrade plan (admin only)
- GET /health - Health check

## Setup
1. Configure env variables in backend/.env
2. Run `npm install` and `npm run seed` in backend
3. Run `npm install` and `npm start` in frontend

## Deployment
- Deploy backend and frontend to Vercel using root directories backend and frontend respectively
- Set environment variables in Vercel dashboard

---

This project satisfies all assignment requirements for multi-tenant SaaS notes app.
