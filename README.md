# Takt

A To-Do REST API — tasks, categories, search, filtering, pagination, and JWT auth.

## Features

- Register / log in / log out (JWT access token + rotating refresh token)
- CRUD for tasks and categories, scoped to the signed-in user
- Task list with pagination, full-text search, category filter, status filter, and sorting
- OpenAPI / Swagger UI

## Tech stack

- .NET 10, ASP.NET Core (controllers), EF Core 10, MS SQL Server 2022
- ASP.NET Core Identity for the user store, custom JWT issuing on top
- FluentValidation, FluentResults, Serilog, Swashbuckle
- Docker Compose for the database and the full stack

## Architecture

Four-layer Onion — dependencies point inward, the core has no framework references.

| Layer | Project | Contents |
|---|---|---|
| Domain | `Takt.Domain` | entities, enums, repository interfaces, pagination primitives — no dependencies |
| Application | `Takt.Application` | services (use cases), DTOs, validators, result/error types |
| Infrastructure | `Takt.Infrastructure` | EF Core `DbContext`, entity configurations, repository implementations, JWT token service |
| API | `Takt.API` | controllers, middleware, DI composition root |

`Takt.DbMigrator` is a console tool that applies migrations (and optionally seeds demo data); it
reuses `Takt.API`'s configuration.

## Running it

Prerequisites: .NET 10 SDK, Docker Desktop. For migrations: `dotnet tool install --global dotnet-ef`.

### Full stack in Docker

```bash
docker compose --profile apps up --build
```

`db` starts, `migrator` applies migrations and seeds a demo account, then `api` comes up on
<http://localhost:8080> (Swagger at `/swagger`).

### Database in Docker, API from the IDE

```bash
docker compose up -d db
cp src/Takt.Backend/Takt.API/.env.example src/Takt.Backend/Takt.API/.env
dotnet run --project src/Takt.Backend/Takt.API
```

The API reads `Takt.API/.env` in Development (via `DotNetEnv`). Apply migrations with either:

```bash
dotnet ef database update --project src/Takt.Backend/Takt.Infrastructure --startup-project src/Takt.Backend/Takt.API
# or
dotnet run --project src/Takt.Backend/Takt.DbMigrator -- --seed
```

### Demo account

Seeded when the migrator runs with `--seed`: `demo@takt.local` / `Password1`.

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
| PATCH | `/tasks/{id}/status` | Bearer | change status only |

Task list query: `?page=1&pageSize=20&search=&categoryId=&status=Todo&sortBy=CreatedAt&sortDescending=true`.

### Auth flow

Access token: HS256 JWT, 15 minutes. Refresh token: opaque random value, 14 days, stored hashed.
`/refresh` revokes the presented token and issues a new pair; presenting an already-revoked token
revokes the user's whole active set.

## Repository layout

```
src/Takt.Backend/
  Takt.Domain  Takt.Application  Takt.Infrastructure  Takt.API  Takt.DbMigrator
docker-compose.yml
```
