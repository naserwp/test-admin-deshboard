# Copilot / AI Agent Instructions

Purpose: help an AI coding agent become immediately productive working in this Next.js App Router + Prisma project.

Key concepts
- App Router + server components: most data fetching and auth checks are done on the server (server components & API routes). See `app/` and `app/api/`.
- Auth: NextAuth with `PrismaAdapter` (see `app/lib/auth.ts`). Sessions use JWTs and include custom fields: **role**, **userId**, **email**, **imageUrl**; `token.sub` maps to `session.user.id`.
- Authorization helpers: use `requireSession()` from `app/api/lib/requireAuth.ts` in server-side API handlers to assert an authenticated user. Middleware (see `middleware.ts`) enforces route-level redirects for `/dashboard` and `/admin` and uses `getToken()`.
- Database: Prisma client is exported from `app/lib/prisma.ts` using the global `prisma` pattern (avoid creating multiple PrismaClients in dev).
- Storage: local uploads use `LocalStorageAdapter` in `app/lib/storage.ts`. Files saved to `/uploads` by `storage.saveFile()`.

Developer workflows & commands
- Install: `npm install`
- Env: copy `.env.example` -> `.env` and fill DB + NextAuth secrets (see README).
- Migrate: `npx prisma migrate dev` (`npm run prisma:migrate`)
- Seed: `npx prisma db seed` or `npm run prisma:seed` (seed creates Admin `userId: admin`, password `Admin@12345`)
- Dev server: `npm run dev`
- Build: `npm run build`

Project-specific conventions to follow
- Login accepts an `identifier` (userId OR email) + `password`. Implementations should call NextAuth Credentials provider or call the API that leverages it (see `app/lib/auth.ts`).
- Rate limiting for login uses `rateLimit("login:${ip}", 5, 60_000)` in `app/lib/rateLimit.ts` — reuse this helper for simple per-IP limits.
- PDF uploads: admin-only and strict validation in `app/api/admin/files/upload/route.ts` — expect `multipart/form-data` with `title` and `file` (PDF only) and call `storage.saveFile()`.
- Error responses: API handlers return `NextResponse.json({ error: "..." }, { status: <code> })` consistently — mirror this style in new endpoints.
- Password updates: `POST /api/account/password` uses `requireSession()`, requires `currentPassword` and `newPassword` (min length 8), and uses bcrypt/bcryptjs. Be careful when changing the bcrypt library used in different files.

Integration points & external dependencies
- NextAuth (see `app/api/auth/[...nextauth]/route.ts` and `app/lib/auth.ts`) with Prisma adapter (`@next-auth/prisma-adapter`).
- Prisma + PostgreSQL (`prisma/schema.prisma`), migrations in `prisma/migrations`.
- Local file storage under `/uploads` for development. Can swap with an S3 adapter (see `app/lib/storage.ts` to build a new adapter).

Practical examples
- Protect a server API route:
  const session = await requireSession();
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

- Upload a PDF (client): POST to `/api/admin/files/upload` as multipart/form-data with fields `title` and `file`.

- Use prisma client:
  import { prisma } from '@/app/lib/prisma';
  await prisma.user.findUnique({ where: { id } });

Notes, gotchas, and testing tips
- The project mixes `bcrypt` and `bcryptjs` in different places; keep this in mind for platform/CI differences and tests.
- Session shape is extended in `types/next-auth.d.ts`. Use `session.user.id`, `session.user.userId`, and `session.user.role` in server and client checks.
- Middleware protects `/admin` and `/dashboard`. To test redirects, call those routes in the browser or simulate `getToken()` in tests.

If something is unclear or you'd like more examples (e.g. scaffolding a new API route, end-to-end test example, or a suggested PR template), tell me which area to expand and I will refine the instructions.