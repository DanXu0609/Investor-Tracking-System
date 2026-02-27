# Beyond EB5 Immigration — Investor Tracking System

A web application for tracking and managing EB5 immigration investor cases through their filing stages.

## Features

- **Investor Dashboard** — View all investors as cards showing current stage, progress, contact info, and investment amount
- **Investor Detail View** — Drill into individual investors to manage their filing stages, mark steps complete, and add notes
- **Timeline Comparison** — Compare progress across all investors side-by-side
- **Customizable Filing Steps** — Admin can edit the default 11-step EB5 filing workflow (consulting packages, accreditation, wire instructions, fund release, etc.)
- **Authentication** — Email/password signup and login via Supabase Auth
- **Role-Based Access** — Admin and user roles; only admins can add/delete investors, manage users, and edit filing steps
- **User Management** — Admins can view all users and change roles
- **Company Branding** — Beyond International logo displayed in the header, login page, and browser favicon

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS 4, Radix UI primitives, shadcn/ui components
- **Backend**: Supabase Edge Functions (Deno + Hono)
- **Database**: Supabase (PostgreSQL key-value store)
- **Auth**: Supabase Auth

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

```
src/
  app/
    App.tsx                  # Main app with routing, state, and auth
    types/investor.ts        # Investor and EB5Stage type definitions
    utils/
      storage.ts             # Investor CRUD (Supabase backend + localStorage fallback)
      supabase.ts            # Supabase client config
    components/
      Header.tsx             # App header with logo upload and user info
      AuthForm.tsx           # Login/signup form
      AddInvestorDialog.tsx   # Add new investor modal
      InvestorCard.tsx        # Investor summary card
      InvestorDetail.tsx      # Full investor detail view
      TimelineComparison.tsx  # Cross-investor progress comparison
      StageSettingsDialog.tsx # Admin filing step editor
      UserManagement.tsx      # Admin user role management
      ui/                    # shadcn/ui component library
supabase/
  functions/server/
    index.tsx                # API endpoints (auth, investors, users)
    kv_store.tsx             # Key-value storage layer
```

## Company Logo

The static logo is at `public/logo-dark.png` and is used in the header, login page, and as the browser favicon.
