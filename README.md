# CampusCare AI

AI-powered Complaint Management System for educational institutions, built on the MERN stack.

## What's scaffolded so far

**Backend** (`/backend`)
- Express + MongoDB (Mongoose) API
- JWT auth with bcrypt password hashing
- Role-based access control (`student` / `admin`) via middleware
- `User` model, `Complaint` model (with placeholder fields for AI categorization/priority/summary/recommended department/suggested solution — ready for you to wire up)
- Image upload via Multer (local disk storage under `/uploads/complaints`)
- Complaint CRUD: create, list own complaints, get by ID, admin list with filters, status updates, basic analytics aggregation
- Anonymous complaint support (identity hidden from non-owners/admins in responses)
- Centralized error handling
- AI integration layer (categorization, priority, summary, department recommendation, solution suggestion


  
**Frontend** (`/frontend`)
- React 18 + Vite + Tailwind
- React Router with protected routes (role-aware)
- Auth context (login/register/logout, JWT persisted in localStorage)
- Axios instance with auth interceptor + auto-logout on 401
- Pages: Login, Register, Student Dashboard, Submit Complaint (with image upload + anonymous toggle), Admin Dashboard (status management + basic analytics cards)

- Complaint detail page (currently only list views exist)
- Department management, admin user management


## Getting started

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`. Vite is configured to proxy `/api` and `/uploads` to the backend, so no CORS setup is needed in dev.

### First admin user
There's no admin signup flow (registration always creates a `student`, on purpose — role is never trusted from client input). To create an admin, register normally, then manually flip `role` to `"admin"` for that user in MongoDB:
```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```
