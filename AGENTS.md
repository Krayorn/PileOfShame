# AGENTS.md — Pile of Shame

## Project Overview

A Warhammer / wargaming miniature collection tracker. Users track unpainted and painted miniatures ("pile of shame"). Full-stack app with a Symfony API backend and a React (Vite) frontend, served via Nginx, all orchestrated with Docker Compose.

## Architecture

- **Backend**: Symfony 7.3 (PHP ≥ 8.1), located in `symfony/`
  - Doctrine ORM with SQLite
  - JWT authentication (LexikJWTAuthenticationBundle)
  - Image handling (Intervention Image + AWS SDK for S3)
  - Domain folders: `Admin/`, `Collection/`, `Painter/`, `Service/`
- **Frontend**: React 19 + TypeScript + Vite, located in `react/`
  - Tailwind CSS v4
  - React Router v6, Axios for API calls
  - shadcn/ui components (Radix UI primitives, class-variance-authority)
  - dnd-kit for drag and drop
  - Path alias: `@/*` → `./src/*`
- **Nginx**: reverse proxy config in `nginx/`
- **Docker Compose**: `docker-compose.yml` (dev), `docker-compose.prod.yml` (prod)

## Commands (via Makefile)

The Makefile at the project root provides all common commands. Always prefer these over raw docker/npm commands.

| Command | Description |
|---|---|
| `make up` | Start dev environment |
| `make down` | Stop all environments |
| `make symfony` | Shell into the Symfony container |
| `make pre-commit` | Run all backend linters/checks (Rector, ECS, PHPStan) |
| `make frontend-build` | Install deps and build React app |
| `make deploy` | Full production deploy (frontend build + docker build + up) |

## Linting & Static Analysis

### Backend (run via `make pre-commit` or individually inside the container)

- **Rector** — automated refactoring: `vendor/bin/rector`
- **ECS (Easy Coding Standard)** — code style fixer: `vendor/bin/ecs --fix`
- **PHPStan** — static analysis: `vendor/bin/phpstan analyse`

Config files: `symfony/rector.php`, `symfony/ecs.php`, `symfony/phpstan.dist.neon`

After making backend changes, run `make pre-commit` to validate.

### Frontend

- **ESLint**: `cd react && npm run lint`
- **TypeScript check**: `cd react && npx tsc --noEmit`

After making frontend changes, run lint and typecheck from the `react/` directory.

## Development Workflow

The developer runs Docker and the frontend dev server themselves. **Never** start/stop Docker containers or the frontend dev server — the developer handles that.

After making backend changes, run `make pre-commit` to validate.
After making frontend changes, run lint and typecheck from the `react/` directory.

## Testing

No test suite is currently configured.

## Key Conventions

- **DDD / domain-based organization**: group code by domain, not by type. Both backend and frontend follow this pattern.
  - Backend domains: `Admin/`, `Collection/`, `Painter/`, `Service/`
- Frontend uses `@/` path alias for imports from `src/`
- UI components follow shadcn/ui patterns (in `react/src/components/`)
- SQLite is used for both dev and prod (via Doctrine)
