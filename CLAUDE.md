# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Epilogue** is a full-stack content management platform with AI-powered post generation, SEO analysis, web curation, and Notion integration. It's a monorepo with two independent apps:

- `backend/` — NestJS 11 + Fastify 5 + TypeORM + MySQL
- `frontend/` — Next.js 16 + React 19 + Tailwind CSS v4 + DaisyUI v5

> **Warning:** This version of Next.js has breaking changes — APIs, conventions, and file structure may differ from training data. Check `frontend/node_modules/next/dist/docs/` before writing frontend code.

---

## Commands

### Backend (`cd backend`)

```bash
npm run start:dev     # dev server with hot reload (port 5000)
npm run build         # compile to /dist
npm run start:prod    # run compiled build
npm run lint          # ESLint with auto-fix
npm run format        # Prettier
npm run test          # unit tests (Jest)
npm run test:watch    # watch mode
npm run test:cov      # coverage report
npm run test:e2e      # e2e tests (Supertest)
npm run seed          # seed the database with Faker.js data
```

### Frontend (`cd frontend`)

```bash
npm run dev     # dev server (port 3000)
npm run build   # production build
npm run start   # production server
npm run lint    # ESLint
```

---

## Architecture

### Backend

**Entry point:** `backend/src/main.ts` — bootstraps Fastify with JWT cookies, Swagger at `/api/docs`, global `ValidationPipe` (whitelist + forbidNonWhitelisted), multipart uploads (20MB), and CORS for `FRONTEND_URL`.

**All routes are prefixed `/api`.** Swagger docs are live at `http://localhost:5000/api/docs`.

**Module structure** — each feature in `src/<feature>/` follows the standard NestJS pattern (module → controller → service → entity):

| Module | Key responsibility |
|---|---|
| `auth` | JWT + cookie auth, Google OAuth2, `/api/auth/me` |
| `users` | User CRUD, roles (ADMIN / PUBLIC) |
| `accounts` | OAuth provider accounts linked to users (Google, Notion) |
| `agency` | Multi-tenant org container with Notion token |
| `content` | Blog/social posts — CRUD, stats, paginated SEO view |
| `content-idea` | AI-generated content ideas before they become posts |
| `content-seo` | SEO score, keywords, AI review per content |
| `content-notion` | Notion page sync status per content |
| `topic` | Topic taxonomy with color tags |
| `curation-source` | RSS/URL sources for content curation |
| `curation-item` | Curated content items from sources |
| `ai` | Mistral AI text generation, web scraping, file analysis |

**Database:** MySQL (port 3307), TypeORM with `synchronize: true` in dev (no manual migrations needed). All entities use UUID primary keys.

**Authentication flow:** HTTP-only cookie (`access_token`) containing a signed JWT. The `JwtAuthGuard` is applied per route. Use `@CurrentUser()` decorator in controllers to get the authenticated user. Role-based access uses `@Roles()` + `RolesGuard`.

**AI layer:**
- `AIService` — wraps Mistral API for text generation and document analysis
- `ScrappingService` — Puppeteer Extra (stealth mode) for URL scraping
- `PromptService` — platform-specific prompt templates (BLOG, LINKEDIN, TWITTER, INSTAGRAM)

### Frontend

**App Router** with three layout groups:
- `(auth)` — login/register pages (no sidebar)
- `(dashboard)` — main dashboard, content posts management
- `(curation)` — curation page
- `(parameters)` — settings/profile

**API calls** all go to `NEXT_PUBLIC_API_URL` (default `http://localhost:5000/api`) with `credentials: 'include'` to send the auth cookie.

**Auth state:** `hooks/useAuth.tsx` fetches `/api/auth/me` — use this hook in any component that needs the current user.

**UI stack:**
- DaisyUI v5 components (btn, card, badge, modal, etc.) with a custom `epilogue` theme
- Primary: `#001B40` (navy), Accent: `#547573` (teal)
- Lucide React for icons
- TipTap for rich text editing in post body
- SweetAlert2 for confirmation dialogs

**Shared types:** `frontend/app/types/types.tsx` defines all shared interfaces (`Content`, `ContentIdea`, `Topic`, `User`, `Agency`, etc.) and the `Platform` enum with per-platform config (maxLength, color, icon).

---

## Key Environment Variables

### Backend (`backend/.env`)
```
DB_HOST / DB_PORT(3307) / DB_USER / DB_PASSWORD / DB_NAME
JWT_SECRET / JWT_EXPIRES
COOKIE_SECRET
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
NOTION_CLIENT_ID / NOTION_CLIENT_SECRET
MISTRAL_API_KEY
FRONTEND_URL / BACKEND_URL
PORT (default 5000)
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Content & Platform Model

**Content** has a `platform` field (BLOG | LINKEDIN | TWITTER | INSTAGRAM) and a `status` field (DRAFT | WAITING_PUBLISH | PUBLISHED). The `Platform` enum in `frontend/app/types/types.tsx` is the single source of truth for per-platform constraints.

**Content creation flow:** ContentIdea → AI generation via `AIService.generatePost()` → Content entity with optional SEO analysis (`ContentSeo`) and Notion sync (`ContentNotion`).
