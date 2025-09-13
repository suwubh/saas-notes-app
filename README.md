# 📓 Multi-Tenant SaaS Notes App

Minimal, secure **multi-tenant** notes application that enforces role-based access and subscription limits.  
Built with **Express + PostgreSQL** on the backend and **React + TypeScript** on the frontend.  
Deployed server-side and client-side on **Vercel**.

---

## ✨ Key Features
- **Shared-schema multi-tenancy** (`tenant_id` column) with strict data isolation
- **JWT authentication** & **role authorisation**  
  • **Admin** – manage users & upgrade plan  
  • **Member** – CRUD notes only
- **Subscription gating**  
  • Free plan → 3-note limit  
  • Pro plan → unlimited notes  
  • `POST /tenants/:slug/upgrade` (admin-only)
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
| Frontend  | https://YOUR-FRONTEND.vercel.app |
| Backend   | https://YOUR-BACKEND.vercel.app |
| Health    | `/health` → `{"status":"ok"}` |

---

## ⚙️ Local Setup

clone repo
git clone https://github.com/your-user/saas-notes-app.git
cd saas-notes-app


### Backend
cd backend
cp .env.example .env # add DATABASE_URL, JWT_SECRET …
npm install
npm run seed # seeds Acme + Globex tenants & users
npm run dev # http://localhost:3001


### Frontend
cd ../frontend
echo "REACT_APP_API_URL=http://localhost:3001" > .env
npm install
npm start # http://localhost:3000


---

## 📡 Essential API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST   | /auth/login         | Login, returns JWT |
| GET    | /auth/me            | Current user |
| POST   | /notes              | Create note |
| GET    | /notes              | List notes of tenant |
| GET    | /notes/:id          | Get one note |
| PUT    | /notes/:id          | Update note |
| DELETE | /notes/:id          | Delete note |
| POST   | /tenants/:slug/upgrade | Upgrade to Pro (admin) |
| GET    | /health             | Health check |

_All endpoints require `Authorization: Bearer <token>` except `/auth/login` and `/health`._

---

## 🏗️ Tech Stack
| Layer      | Tech |
|------------|------|
| Backend    | Node 18, **Express.js**, PostgreSQL (Neon), jwt, bcryptjs |
| Frontend   | **React 18**, TypeScript, Axios, React Router v6 |
| Dev & Ops  | Vercel (serverless functions & static hosting), ESLint + Prettier |

---

## 🚀 Deploying to Vercel

1. **Backend**  
   - Root dir: `backend`  
   - Env vars: `DATABASE_URL  JWT_SECRET  JWT_EXPIRES_IN=7d`  
2. **Frontend**  
   - Root dir: `frontend`  
   - Env var: `REACT_APP_API_URL=https://YOUR-BACKEND.vercel.app`

Vercel’s GitHub integration auto-builds and redeploys on every push.

---

