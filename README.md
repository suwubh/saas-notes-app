# 📓 Multi-Tenant SaaS Notes App

Minimal, secure **multi-tenant** notes application that enforces role-based access and subscription limits.

This repository contains two top-level projects: `backend` (Express + PostgreSQL) and `frontend` (React + TypeScript). Deployments use Vercel for both serverless backend functions and static hosting.

---

## ✨ Key Features

- **Shared-schema multi-tenancy** using a `tenant_id` column for strict data isolation.
- **JWT authentication** + **role-based authorization**:
  - **Admin** — manage users & upgrade plan
  - **Member** — create/read/update/delete notes
- **Subscription gating**:
  - **Free** plan → 3-note limit
  - **Pro** plan → unlimited notes
  - Admin-only route to upgrade: `POST /tenants/:slug/upgrade`
- **Complete Notes API**: create, list, read, update, delete
- **Ready-to-use test accounts** (password `password`):
  - `admin@acme.test`  (Admin)
  - `user@acme.test`   (Member)
  - `admin@globex.test` (Admin)
  - `user@globex.test` (Member)

---

## 🔗 Live Demo

| Service   | URL |
|-----------|-----|
| Frontend  | `https://YOUR-FRONTEND.vercel.app` |
| Backend   | `https://YOUR-BACKEND.vercel.app` |
| Health    | `https://YOUR-BACKEND.vercel.app/health` → `{"status":"ok"}` |

> Replace `YOUR-FRONTEND` / `YOUR-BACKEND` with your Vercel project names.

---

## ⚙️ Local Setup

Open a terminal and follow the steps below.

### Clone the repo

```bash
git clone https://github.com/your-user/saas-notes-app.git
cd saas-notes-app
```

### Backend

```bash
cd backend
# copy example env and edit values (DATABASE_URL, JWT_SECRET, etc.)
cp .env.example .env

# install dependencies
npm install

# seed demo tenants + users
npm run seed

# start dev server (default: http://localhost:3001)
npm run dev
```

**Example `.env.example`**

```env
# PostgreSQL (Neon, Supabase, or local Postgres)
DATABASE_URL=postgres://user:pass@host:5432/dbname

# JWT settings
JWT_SECRET=supersecret_jwt_key
JWT_EXPIRES_IN=7d

# Optional: port override
PORT=3001
```


### Frontend

```bash
cd ../frontend
# point the frontend at the local API during development
printf "REACT_APP_API_URL=http://localhost:3001\n" > .env

# install and run
npm install
npm start # http://localhost:3000
```

**Project structure (high-level)**

```text
/ (repo root)
├─ backend/       # Express server, database migrations & seeds
├─ frontend/      # React + TypeScript app
└─ README.md      # this file
```

---

## 📡 Essential API Endpoints (summary)

> All endpoints require the header: `Authorization: Bearer <token>` unless stated otherwise.

| Method | Path | Description |
|--------|------|-------------|
| POST   | `/auth/login`         | Login, returns JWT (no auth required) |
| GET    | `/auth/me`            | Current user (requires JWT) |
| POST   | `/notes`              | Create note |
| GET    | `/notes`              | List notes for tenant |
| GET    | `/notes/:id`          | Get a single note |
| PUT    | `/notes/:id`          | Update a note |
| DELETE | `/notes/:id`          | Delete a note |
| POST   | `/tenants/:slug/upgrade` | Upgrade tenant to Pro (admin only) |
| GET    | `/health`             | Health check (no auth required) |

**Sample curl — login**

```bash
curl -X POST https://YOUR-BACKEND.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.test","password":"password"}'

# Response (example):
# {
#   "token": "eyJhbGciOi...",
#   "user": { "id": "...", "email": "admin@acme.test", "role": "admin", "tenant_id": "acme" }
# }
```

**Sample curl — create note (use token from login)**

```bash
curl -X POST http://localhost:3001/notes \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Meeting notes","content":"Discuss Q3 roadmap"}'
```

---

## 🧩 Authorization & Tenancy

- Every protected resource is validated against the authenticated user's `tenant_id`.
- Role checks enforce `admin` vs `member` operations. For example, only `admin` may call `/tenants/:slug/upgrade`.
- Subscription limits are enforced at the API layer; free tenants are prevented from creating more than 3 notes.

---

## 🛠️ Database & Seeding

The backend includes a seed script to create two demo tenants (Acme, Globex) and test users. Run:

```bash
npm run seed
```

Typical seed actions:
- create tenants `acme`, `globex`
- create `admin@acme.test` / `user@acme.test` and `admin@globex.test` / `user@globex.test`

---

## 🚀 Deploying to Vercel

**Backend (serverless functions)**
- Root directory: `backend`
- Environment variables to configure on Vercel:

```
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN=7d
```

**Frontend (static site)**
- Root directory: `frontend`
- Environment variable:

```
REACT_APP_API_URL=https://YOUR-BACKEND.vercel.app
```

Vercel's GitHub integration will build and deploy on each push to your selected branch.

---

## ✅ Developer tips

- Use `NODE_ENV=development` locally; set `NODE_ENV=production` on Vercel.
- Use a secure `JWT_SECRET` (random 32+ char string) in production.
- Run linting and formatters prior to committing: `npm run lint` / `npm run format` (if configured).

---

## 🔐 Security notes

- Never commit real `.env` files. Keep secrets in Vercel or your chosen secret manager.
- Passwords in the demo are intentionally weak (`password`) for local testing only. Change them in any public or production environment.

---


Tell me which of the above you'd like next.
