# BdSmartLeadX-02 Architecture

Production-ready enterprise Lead Intelligence & Management architecture built from scratch.

## Tech Stack
- **Framework**: Next.js App Router / Vite React Architecture
- **Language**: TypeScript (ES2022)
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (`@supabase/supabase-js`)
- **Deployment**: Vercel & GitHub Ready

## Folder Architecture

```text
/
├── .env.example            # Environment variable specifications
├── vercel.json             # Vercel deployment configuration
├── metadata.json           # Application metadata & permissions
├── package.json            # Scripts & dependencies
├── src/
│   ├── app/                # App Router structure & route mappings
│   │   ├── routes.ts       # Centralized route definitions & RBAC requirements
│   │   └── AppShell.tsx    # Application shell & route manager
│   ├── components/         # Shared component architecture
│   │   ├── auth/           # Route protection & role guards
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── RoleGuard.tsx
│   │   └── layout/         # Shared layouts
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       ├── Navbar.tsx
│   │       ├── Sidebar.tsx
│   │       └── MainLayout.tsx
│   ├── context/            # Global state contexts
│   │   ├── AuthContext.tsx # Supabase authentication provider
│   │   ├── UserContext.tsx # User session profile provider
│   │   └── AdminContext.tsx# Admin state provider
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useRole.ts
│   │   ├── useLead.ts
│   │   ├── useAdmin.ts
│   │   └── useUser.ts
│   ├── lib/                # SDK clients & utilities
│   │   ├── env.ts          # Environment variable validator
│   │   └── supabase/       # Supabase client instances
│   │       ├── client.ts   # Browser client
│   │       ├── server.ts   # Server client
│   │       └── middleware.ts# Auth refresh helper
│   ├── services/           # Service layer for Supabase operations
│   │   ├── authService.ts  # Supabase Auth operations
│   │   ├── leadsService.ts # Leads CRUD operations
│   │   ├── adminService.ts # User management & audit logs
│   │   └── userService.ts  # Profile & preferences operations
│   ├── types/              # Strict TypeScript interface definitions
│   │   ├── auth.ts
│   │   ├── leads.ts
│   │   ├── admin.ts
│   │   ├── user.ts
│   │   └── index.ts
│   ├── App.tsx             # Entry wrapper with Providers
│   └── main.tsx            # DOM root mounting
```

## Environment Variables

Create a `.env.local` or configure environment variables in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## Deployment to Vercel

1. Push repository to GitHub.
2. Import project in Vercel.
3. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Environment Variables.
4. Deploy with `npm run build`.

---
*Created from scratch for BdSmartLeadX-02.*
