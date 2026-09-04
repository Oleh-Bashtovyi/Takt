# Takt

<div align="center">

![.NET 10](https://img.shields.io/badge/-.NET%2010-512BD4?logo=dotnet&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-512BD4?logo=dotnet&logoColor=white)
![Angular 22](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL%20Server-CC2927?logo=microsoftsqlserver&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**A calm, Microsoft To-Do–style task manager — ASP.NET Core REST API + Angular SPA.**

</div>

## Overview

Takt is a full-stack to-do application: sign up, organise tasks into lists, search and filter
them, check them off. It was built as a take-home assignment for a job application, so the
README leans on being explicit about what's actually implemented and how to run it, rather than
a marketing pitch.

---

## Tech Stack

### Backend — `src/Takt.Backend/`
- **.NET 10** — ASP.NET Core Web API (controllers)
- **EF Core** + **SQL Server**
- **ASP.NET Core Identity** for the user store, custom JWT issuing on top (access + rotating
  refresh tokens)
- **FluentValidation** + **FluentResults** — validation and a Result pattern; exceptions are
  reserved for genuinely unexpected failures, not control flow
- **Serilog** — structured logging
- **Swashbuckle** — OpenAPI / Swagger UI

### Frontend — `src/Takt.Frontend/`
- **Angular 22** — standalone components, zoneless change detection, Signals for state
- **Tailwind CSS v4**
- **`httpResource`** for reads (auto-refetch when its params change) + plain `HttpClient`/RxJS
  for mutations — no NgRx, no TanStack/Apollo-style query library
- **Reactive Forms**

---

## Core Features

- **Auth** — register / log in / log out; JWT access token + rotating refresh token, with silent
  refresh on a 401 and again at app startup
- **Tasks** — create, view, edit, delete; title, description, priority, due date, category
- **Categories** — inline CRUD in the sidebar (create, rename, delete — rename/delete via a
  right-click context menu)
- **Search & sort** — case-insensitive search across title + description; sort by priority, due
  date, title, or date added, either direction
- **Active / Completed tabs** with numbered pagination
- **Task detail drawer** for editing, toast notifications for background failures

---

## Architecture

### Backend — four-layer Onion

Dependencies point inward; the domain has no framework references.

| Layer | Project | Contents |
|---|---|---|
| Domain | `Takt.Domain` | entities, enums, repository interfaces, pagination primitives — no dependencies |
| Application | `Takt.Application` | services (use cases), DTOs, validators, result/error types |
| Infrastructure | `Takt.Infrastructure` | EF Core `DbContext`, entity configurations, repository implementations, JWT token service |
| API | `Takt.API` | controllers, middleware, DI composition root |

`Takt.DbMigrator` is a standalone console tool that applies migrations (and optionally seeds
demo data); it reuses `Takt.API`'s configuration so the connection string lives in one place.

### Frontend — feature folders

- `core/` — auth service, route guards, the auth HTTP interceptor
- `features/` — one folder per screen/domain area (`tasks`, `categories`, `auth`, `profile`,
  `landing`), each with its own service where it needs one
- `shared/components/` — cross-feature UI: the workspace shell/header, form field components,
  the icon registry, toasts
- The whole authenticated workspace is **one route** (`/app`); category, search, sort, the
  active/completed tab, and the page number are all query-param-driven, not sub-routes
- No global HTTP error interceptor — auth forms show inline errors, section reads show an inline
  retry state, mutations raise a toast

---

## Repository Structure

```
takt/
├── src/
│   ├── Takt.Backend/
│   │   ├── Takt.Domain           # entities, enums, repository interfaces
│   │   ├── Takt.Application      # services, DTOs, validators
│   │   ├── Takt.Infrastructure   # EF Core, Identity, JWT, repositories
│   │   ├── Takt.API              # controllers, middleware, DI composition root
│   │   └── Takt.DbMigrator       # standalone migration + seeding console tool
│   └── Takt.Frontend/
│       └── src/app/
│           ├── core/             # auth service, guards, HTTP interceptor
│           ├── features/         # landing, auth, tasks, categories, profile
│           └── shared/components/# workspace shell, form fields, drawer, toasts
├── docker-compose.yml
└── README.md
```

---

## Running Locally

### Prerequisites

.NET 10 SDK, Node 20+, Docker Desktop. For manual EF migrations from the CLI:
`dotnet tool install --global dotnet-ef`.

### 1. Backend

#### Option A — full backend stack in Docker

```bash
docker compose --profile apps up --build
```

`db` starts, `migrator` applies migrations and seeds the demo account, then `api` comes up on
<http://localhost:8080> (Swagger at `/swagger`).

#### Option B — database in Docker, API from the IDE

This is the option to use if you also want to run the frontend locally — the Angular dev server
is hard-coded to talk to `http://localhost:5189`, not the Dockerised API on `:8080`.

```bash
docker compose up -d db
cp src/Takt.Backend/Takt.API/.env.example src/Takt.Backend/Takt.API/.env
dotnet run --project src/Takt.Backend/Takt.API
```

API on <http://localhost:5189> (Swagger at `/swagger`). The API reads `Takt.API/.env` in
Development via `DotNetEnv`.

### 2. Migrations & seeding

Apply migrations with either the EF CLI or the migrator tool; the migrator can also seed a demo
account:

```bash
dotnet ef database update --project src/Takt.Backend/Takt.Infrastructure --startup-project src/Takt.Backend/Takt.API
# or
dotnet run --project src/Takt.Backend/Takt.DbMigrator -- seed-data
```

The migrator always applies migrations; pass `seed-data` to also seed demo data. In Visual
Studio, `Takt.DbMigrator` has **Migrate** and **Migrate and seed** launch profiles for the same
thing. Seeding is idempotent — re-running it against a database that already has the demo
account does nothing.

**Demo account:** `demo@takt.local` / `Password1` — three categories: one with a couple of
tasks, one with 25 tasks and a deliberately long name (to exercise text truncation), and one
with 105 tasks (enough to page through).

### 3. Frontend

```bash
cd src/Takt.Frontend
npm install
npm start
```

Runs on <http://localhost:4200> and talks to the API on `:5189` (Option B above). CORS on the
API already allows `http://localhost:4200`.

---

## API

Base path `api/`. All endpoints return JSON; failures use RFC 7807 `ProblemDetails`.

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | — | create an account, returns tokens |
| POST | `/auth/login` | — | returns tokens |
| POST | `/auth/refresh` | — | rotate the token pair |
| POST | `/auth/logout` | Bearer | revoke the refresh token |
| GET | `/auth/me` | Bearer | current user |
| GET/POST | `/categories` | Bearer | list / create |
| GET/PUT/DELETE | `/categories/{id}` | Bearer | read / update / delete |
| GET/POST | `/tasks` | Bearer | list (paged/filtered) / create |
| GET/PUT/DELETE | `/tasks/{id}` | Bearer | read / update / delete |
| PATCH | `/tasks/{id}/completion` | Bearer | toggle done / not done |

Task list query: `?page=1&pageSize=20&search=&categoryId=&isCompleted=&sortBy=CreatedAt&sortDescending=true`.

### Auth flow

Access token: HS256 JWT, 15 minutes. Refresh token: opaque random value, 14 days, stored hashed.
`/refresh` revokes the presented token and issues a new pair; presenting an already-revoked token
revokes the user's whole active set.

---

## License

Licensed under the [MIT License](./LICENSE).
