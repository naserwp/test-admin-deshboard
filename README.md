# Virtual Office Documents

A production-ready Next.js App Router application for securely managing office documents, with role-based access controls for admins.

## Tech Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL
- NextAuth (Credentials provider)
- bcrypt for password hashing

## Features

- Admin and user roles
- Admin upload PDFs and assign to one or many users
- Users see assigned PDFs, locked/unlocked state
- Secure view/download endpoints with server-side checks
- Local disk storage adapter (`/uploads`) designed for S3 replacement

## Folder Structure

```
app/
  admin/             # Admin dashboards
  auth/              # Login/signup pages
  api/               # Route handlers
  components/        # Shared UI components
  lib/               # Auth, prisma, storage, rate limit helpers
prisma/              # Prisma schema and seed
uploads/             # Local PDF storage (dev)
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from example:

```bash
cp .env.example .env
```

3. Run migrations:

```bash
npx prisma migrate dev
```

4. Seed the admin user:

```bash
npx prisma db seed
```

5. Start the dev server:

```bash
npm run dev
```

## Environment Configuration

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string. |
| `NEXTAUTH_SECRET` | Secret for NextAuth sessions. |
| `NEXTAUTH_URL` | Base URL for NextAuth callbacks. |
| `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` | Feature flag to show the Google sign-in UI. |

## Manual Test Checklist

- Landing page renders sections and CTA buttons.
- Sign in page shows Google button and credential form.
- Sign up page accepts user ID, email, and password.
- User dashboard loads assignments and shows status badges.
- Admin overview displays counts and navigation links.

## Seeded Admin

- **User ID:** `admin`
- **Password:** `Admin@12345`

## Notes

- PDF files are stored locally in `/uploads` for development.
- The storage adapter can be swapped for S3 later (`app/lib/storage.ts`).
- Access to `/admin` and `/dashboard` routes is protected by middleware.
