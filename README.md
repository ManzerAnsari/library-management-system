# Library Management System

A full-stack **Library Management System** with role-based access (Student, Librarian, Admin). Students can browse books and view their borrowings; librarians and admins manage the catalog, issue/return books, and (admin only) manage users. Built with **React** (Vite) on the frontend and **Node.js / Express** with **MongoDB** on the backend.

---

## Table of Contents

- [Features](#features)
- [Tech Stack & Libraries](#tech-stack--libraries)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Seed Data & Default Credentials](#seed-data--default-credentials)
- [API Overview](#api-overview)
- [Role-Based Access](#role-based-access)
- [License](#license)

---

## Features

### Authentication & Users

- **Login** – Email/password login with JWT (access + refresh tokens).
- **Registration (Students)** – Multi-step signup: request OTP → verify email → account created. Optional mobile number and college user ID.
- **Forgot / Reset Password** – Request reset link via email; reset with token.
- **Refresh Token** – HttpOnly cookie-based refresh for seamless session extension.
- **Profile** – View and edit fullname, mobile number, college user ID. Optional **library card** export (image via html2canvas).
- **Role-Based Routing** – Separate dashboards and routes for Student, Librarian, and Admin; unauthorized users redirected to `/unauthorized`.

### Books

- **Catalog** – Paginated, searchable list of books (title, author, ISBN, copies, availability, tags).
- **Add / Edit / Delete Books** – Librarian and Admin can create, update, and delete books (title, author, ISBN, description, publisher, published date, copies, tags).
- **Borrow (Issue)** – Librarian/Admin can issue a book to a student (select book + user, set due date). Students cannot issue for themselves from the UI; issue is done by staff.

### Borrowings

- **My Borrowings (Student)** – View own borrowings with status: Active, Overdue, Returned. Pagination and search.
- **Issue / Return (Librarian & Admin)** – List all borrowings, filter by status (active / overdue / returned) and search; mark books as returned.
- **Issue Book** – From the Books page, “Issue” opens a modal to select a student and due date and create a borrowing.

### User Management (Admin Only)

- **List Users** – Paginated, searchable list of all users (fullname, email, role, etc.).
- **Add User** – Create new users (Student or Librarian role) with email and password.
- **Delete User** – Remove a user (with confirmation). Admin cannot delete themselves.

### Dashboard & Navigation

- **Dashboards** – Role-specific landing pages with quick links (Books, Borrowings, Profile; Admin also has Users).
- **Sidebar & Navbar** – Layout with role-based menu and logout.

### Backend / Security

- **Validation** – Request validation with Zod (auth, books, borrowings, users).
- **Rate Limiting** – Express rate limit to reduce abuse.
- **Helmet** – Security headers.
- **CORS** – Configurable frontend origin with credentials.
- **Email** – Nodemailer for registration OTP and password-reset emails (optional; if not configured, OTP/reset info is logged in dev).

---

## Tech Stack & Libraries

### Frontend (`client-app`)

| Library | Purpose |
|--------|---------|
| **React** | UI and components |
| **Vite** | Build tool and dev server |
| **React Router DOM** | Client-side routing and role-based routes |
| **Ant Design (antd)** | UI components (forms, tables, modals, cards, etc.) |
| **Tailwind CSS** | Utility-first styling |
| **Zustand** | Global state (auth store with persistence) |
| **Axios** | HTTP client for API calls |
| **React Toastify** | Toast notifications |
| **@iconify/react** | Icons (e.g. MDI) in navbar/sidebar |
| **html2canvas** | Export profile “library card” as image |

### Backend (`server-app`)

| Library | Purpose |
|--------|---------|
| **Express** | Web server and API routes |
| **MongoDB / Mongoose** | Database and ODM (User, Book, Borrowing, OTP, tokens) |
| **bcryptjs** | Password hashing |
| **jsonwebtoken** | Access token generation and verification |
| **cookie-parser** | Parse refresh token cookie |
| **Zod** | Request/query validation |
| **Helmet** | Security headers |
| **cors** | Cross-origin requests (frontend URL) |
| **express-rate-limit** | Rate limiting |
| **morgan** | HTTP request logging |
| **dotenv** | Environment variables |
| **nodemailer** | Send registration OTP and password-reset emails |

---

## Project Structure

```
library-management-system/
├── client-app/                 # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/                # API modules (auth, books, borrowings, users)
│   │   ├── components/         # Layout (Navbar, Sidebar, AppLayout), routing (ProtectedRoute, RoleRoute)
│   │   ├── config/             # routes.jsx, navConfig.js
│   │   ├── hooks/              # useDebounce
│   │   ├── lib/                # axios instance, redirectByRole
│   │   ├── pages/              # Login, Register, Books, Borrowings, Profile, dashboards, AdminUsers, Unauthorized
│   │   ├── stores/             # authStore (Zustand)
│   │   └── theme/              # antd theme
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server-app/                 # Node.js backend
│   ├── controllers/            # auth, book, borrowing, user
│   ├── middleware/             # auth (JWT), requireRole, validate, errorHandler, asyncHandler
│   ├── models/                 # User, Book, Borrowing, RegistrationOTP, PasswordResetToken, RefreshToken
│   ├── routes/                 # auth, protected, users, books, borrowings
│   ├── scripts/                # seed.js (admin, librarians, sample books)
│   ├── utils/                  # email (nodemailer)
│   ├── validators/             # Zod schemas (auth, book, borrowing, user)
│   ├── server.js
│   └── package.json
└── README.md
```

---

## Prerequisites

- **Node.js** (v18+ recommended)
- **MongoDB** (local or Atlas)
- **npm** (or yarn/pnpm)

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd library-management-system
```

### 2. Backend

```bash
cd server-app
cp .env.example .env
# Edit .env: MONGO_URI, JWT/ACCESS_TOKEN_SECRET, FRONTEND_URL, optional EMAIL_*
npm install
npm run dev
```

Server runs at `http://localhost:5000` by default.

### 3. Frontend

```bash
cd client-app
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api (or your API URL)
npm install
npm run dev
```

App runs at `http://localhost:5173` by default.

### 4. Seed database (optional)

From `server-app`:

```bash
npm run seed
```

This creates an admin, librarians, and sample books. Use these to log in and test (see [Seed Data](#seed-data--default-credentials)).

---

## Environment Variables

### Backend (`server-app/.env`)

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development` / `production` |
| `PORT` | Server port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` / `ACCESS_TOKEN_SECRET` | JWT signing secret |
| `ACCESS_TOKEN_EXPIRY` | e.g. `15m` |
| `REFRESH_TOKEN_EXPIRES_DAYS` | e.g. `7` |
| `REFRESH_COOKIE_NAME`, `REFRESH_COOKIE_PATH`, `REFRESH_COOKIE_SAMESITE` | Cookie options |
| `FRONTEND_URL` | Frontend origin for CORS and reset-password links |
| `REGISTRATION_OTP_EXPIRES_MINUTES` | OTP validity |
| `RESET_TOKEN_EXPIRES_HOURS` | Password reset token validity |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` | SMTP for OTP and reset emails |
| `BORROW_DAYS` | Default days for new borrowings (e.g. `14`) |

### Frontend (`client-app/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API base URL, e.g. `http://localhost:5000/api` (no trailing slash) |

---

## Seed Data & Default Credentials

After `npm run seed` in `server-app`:

| Role | Email | Password |
|------|--------|----------|
| Admin | `admin@library.local` | `Password123!` |
| Librarian | `librarian@library.local` | `Password123!` |
| Librarian | `librarian2@library.local` | `Password123!` |

**Change these in production.** The seed also adds 50+ sample books.

---

## API Overview

Base path: `/api`.

| Area | Endpoints |
|------|-----------|
| **Auth** | `POST /auth/register`, `/auth/register/resend`, `/auth/register/verify`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `GET /auth/me`, `PUT /auth/me` |
| **Books** | `GET /books`, `GET /books/:id`, `POST /books`, `PUT /books/:id`, `DELETE /books/:id` |
| **Borrowings** | `GET /borrowings`, `GET /borrowings/:id`, `POST /borrowings` (issue), `POST /borrowings/:id/return` |
| **Users** | `GET /users`, `POST /users`, `DELETE /users/:id` (admin only; via protected routes) |

Protected routes use `Authorization: Bearer <accessToken>`. Refresh is done via `POST /api/auth/refresh` with the HttpOnly cookie.

---

## Role-Based Access

| Role | Books | Borrowings | Users | Profile |
|------|--------|------------|--------|--------|
| **Student** | View, search | View own only | — | View/edit own |
| **Librarian** | View, search, add, edit, delete; Issue book | List all, return, issue | — | View/edit own |
| **Admin** | Same as Librarian | Same as Librarian | List, add, delete | View/edit own |

- **Student** – Register via OTP; browse books; see “My Borrowings”; update profile; library card export.
- **Librarian** – Same as student plus: manage books (CRUD), issue/return books.
- **Admin** – Same as librarian plus: user management (list, add, delete). Admins and librarians are created by another admin or via seed.

---

## License

ISC (or as specified in the repository).
