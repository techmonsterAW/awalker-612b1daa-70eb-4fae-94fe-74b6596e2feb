# Secure Task Management System

A full-stack task management application with JWT authentication, role-based access control (RBAC), organization scoping, and an audit log. Built with an Nx monorepo: NestJS API, Angular dashboard, and shared TypeScript libraries.

---

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the repository root (or set environment variables):

```env
# Required for API
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/taskdb
JWT_SECRET=your-secret-key-min-32-chars-for-production
JWT_EXPIRES_IN=7d
```

- **DATABASE_URL** – PostgreSQL connection string. The API uses TypeORM with `synchronize: true` in non-production, so the schema is created/updated on startup.
- **JWT_SECRET** – Secret used to sign JWTs. Use a long, random value in production.
- **JWT_EXPIRES_IN** – Token lifetime (e.g. `7d`, `24h`).

### 3. Run the API

```bash
# Development (watch mode)
npx nx serve api

# Or build and run production bundle
npx nx build api
node dist/apps/api/run.js
```

API runs at **http://localhost:3333** (or `PORT` env).

### 4. Run the dashboard

```bash
npx nx serve dashboard
```

Dashboard runs at **http://localhost:4200** and proxies `/api` to the API.

### 5. Seed the database (optional)

On first run, the API seed creates:

- **Default org** with two users (same org so both see the same tasks):
  - `admin@example.com` / `password123` (role: Admin)
  - `viewer@other.org` / `password123` (role: Viewer)
- A sample task (viewer sees it read-only; admin can edit/delete)

Set `SKIP_SEED=true` to disable seeding.

---

## Architecture

### Nx layout

- **apps/api** – NestJS backend (REST API, TypeORM, Passport JWT, guards).
- **apps/dashboard** – Angular 18 frontend (Tailwind, standalone components).
- **libs/data** – Shared TypeScript only: API contracts (DTOs, enums). No Nest or Angular dependencies. Single source of truth for request/response shapes.
- **libs/auth** – Backend-oriented: permission constants, role–permission mapping, `hasPermission()`. Used only by the API; the dashboard uses role from JWT/user for UI only.

### Dependency graph

- **api** → data, auth  
- **dashboard** → data  
- **dashboard** does not import auth (RBAC is enforced server-side; UI hides actions by role).

### Run both apps

```bash
npx nx run-many -t serve -p api,dashboard
```

---

## Data model

### Entities (PostgreSQL)

- **Organization** – `id`, `name`, `parentId` (optional). Two-level hierarchy: parent and child orgs.
- **User** – `id`, `email`, `passwordHash`, `organizationId`, `role` (owner | admin | viewer).
- **Task** – `id`, `title`, `description`, `status`, `category`, `organizationId`, `createdById`, `order`, `createdAt`, `updatedAt`.
- **AuditLog** – `id`, `userId`, `action`, `resourceType`, `resourceId`, `timestamp`, `details`.

### Relationships

- User belongs to one Organization. Task belongs to one Organization and one creator (User).
- GET /tasks returns tasks for the user’s organization and its child orgs (org IDs = user’s org + children).

### ER (conceptual)

```
Organization 1──* User
Organization 1──* Task  *──1 User (createdBy)
AuditLog (userId, no FK required for simplicity)
```

---

## Access control

### Roles and permissions

| Role   | task:read | task:create | task:update | task:delete | audit:read |
|--------|-----------|-------------|-------------|-------------|------------|
| Owner  | ✓         | ✓           | ✓           | ✓           | ✓          |
| Admin  | ✓         | ✓           | ✓           | ✓           | ✓          |
| Viewer | ✓         | —           | —           | —           | —          |

- **JWT** – Issued at login; contains `sub` (user id), `email`, `role`, `organizationId`. Validated by `JwtAuthGuard` on every request except those marked `@Public()` (e.g. POST /auth/login).
- **Permission checks** – `@RequirePermission('permission')` plus `PermissionsGuard` ensure the user’s role has the required permission. Used on tasks and audit-log endpoints.
- **Org scoping** – Tasks are filtered by the user’s organization (and child orgs). Update/delete ensure the task’s `organizationId` matches the user’s org (or child).

---

## API

Base path: **/api** (e.g. http://localhost:3333/api).

### Auth

**POST /api/auth/login** (public)

- Body: `{ "email": "admin@example.com", "password": "password123" }`
- Response: `{ "accessToken": "<jwt>", "user": { "id", "email", "role", "organizationId" } }`
- 401 on invalid credentials.

### Tasks

All require `Authorization: Bearer <token>` and the listed permission.

| Method | Endpoint           | Permission   | Description                    |
|--------|--------------------|-------------|--------------------------------|
| GET    | /api/tasks         | task:read   | List tasks (org-scoped)        |
| POST   | /api/tasks         | task:create | Create task                    |
| PUT    | /api/tasks/:id     | task:update | Update task (same org)         |
| DELETE | /api/tasks/:id     | task:delete | Delete task (same org)         |

**POST /api/tasks** body: `{ "title", "description?", "status?", "category?" }`  
**PUT /api/tasks/:id** body: partial `{ "title", "description", "status", "category", "order" }`.

### Audit log

**GET /api/audit-log** – Permission: audit:read (Owner, Admin). Returns list of audit entries. Query: `?limit=200`.

---

## Tests

### Backend (Jest)

- **Unit:** `AuthService` – login returns token for valid credentials; invalid credentials → 401.
- **E2E:** With `DATABASE_URL` set, `app.e2e-spec.ts` runs: login 200/401, guarded route 401, GET /tasks with token, Viewer 403 on POST /tasks and GET /audit-log, Admin GET /audit-log 200, task CRUD.

Run:

```bash
# Unit tests (no DB)
npx jest --config=jest.api.config.js

# E2E (requires DATABASE_URL)
DATABASE_URL=postgresql://... npx jest --config=jest.api.config.js --testPathPattern=app.e2e-spec
```

Or: `npx nx run api:test` (runs all API tests; E2E are skipped if `DATABASE_URL` is not set).

### Frontend

- Login and task list/permission specs can be added and run with the Angular test runner when configured.

---

## Future

- **Refresh tokens** – Short-lived access token + refresh token flow.
- **CSRF** – If moving to cookie-based auth, add CSRF protection.
- **RBAC caching** – Cache permission checks per request or per user.
- **Scaling** – Extract permission checks to a shared layer; consider event-driven audit.
- **Advanced delegation** – Per-resource or per-project roles.

---

## Useful commands

| Command                    | Description              |
|---------------------------|--------------------------|
| `npx nx serve api`        | Start API dev server     |
| `npx nx serve dashboard`  | Start dashboard dev server |
| `npx nx build api`        | Build API                |
| `npx nx build dashboard`  | Build dashboard          |
| `npx nx run api:test`     | Run API tests            |
