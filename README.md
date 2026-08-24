# Debt Tracker

A personal finance app for tracking and managing debt with a supportive, minimalist design.

## Tech Stack

- **Next.js 14** - React framework
- **Supabase** - PostgreSQL database + authentication
- **NextAuth** - Authentication layer
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- Supabase account (free at https://supabase.com)

### 2. Installation

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. In your Supabase project:
   - Go to Settings → API
   - Copy your Project URL and Anon Key

3. Create `.env.local` in the root directory:

```bash
cp .env.example .env.local
```

4. Fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only and required — without it the
settings page (change password, delete account, profile) fails.

### 4. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output and paste it in `.env.local` for `NEXTAUTH_SECRET`

### 5. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see your app.

## Project Structure

```
debt-tracker/
├── pages/
│   ├── api/
│   │   └── auth/[...nextauth].ts    # NextAuth configuration
│   ├── auth/
│   │   ├── login.tsx                # Login page
│   │   └── signup.tsx               # Sign up page
│   ├── dashboard.tsx                # Main dashboard
│   └── _app.tsx                     # App wrapper
├── lib/
│   └── supabase.ts                  # Supabase client
├── styles/
│   └── globals.css                  # Global styles
└── ...config files
```

## Database

The schema is not yet checked in — the tables (`users`, `debts`, `payments`,
`missed_payments`) live only in the hosted Supabase project, so a fresh clone
cannot recreate them. Worth exporting to `supabase/migrations/`.

### Row-level security

**Run `supabase/rls.sql` once against the project.** The anon key is public
(it ships in the browser bundle), so without RLS anyone holding it can read
these tables directly through the Supabase REST API.

Two clients, and the split matters:

| Client | Key | Use |
| --- | --- | --- |
| `lib/supabase.ts` | anon | auth flows only — sign in, sign up, password reset |
| `lib/supabaseAdmin.ts` | service role | all table access, from `pages/api` only |

Because the API routes go through the service role (which bypasses RLS), RLS
can stay fully closed to anon while the app keeps working. Per-user isolation
is therefore enforced by the `user_id` filters in the route handlers — so
**every query touching user data must carry one**, and any route taking an id
from the request must verify ownership before using it.

## Helpful Links

- [Supabase Docs](https://supabase.com/docs)
- [NextAuth Docs](https://next-auth.js.org)
- [Next.js Docs](https://nextjs.org/docs)
