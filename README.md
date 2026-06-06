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
cp .env.local.example .env.local
```

4. Fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000
```

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

## Next Steps

1. **Auth is set up!** Users can now sign up and log in
2. Next: Set up the database schema for debts
3. Then: Build the dashboard UI
4. Finally: Add debt tracking features

## Helpful Links

- [Supabase Docs](https://supabase.com/docs)
- [NextAuth Docs](https://next-auth.js.org)
- [Next.js Docs](https://nextjs.org/docs)
