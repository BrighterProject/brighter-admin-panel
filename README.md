# brighter-admin-panel

Admin dashboard for managing users, properties, bookings, and platform settings.

**Runtime:** Vite + Bun | **Served at:** `/admin`

## Stack

- React Router DOM v7 (flat route config)
- TanStack Query v5
- React Hook Form + Zod
- Zustand (global state)
- Tailwind 4 + shadcn/ui
- Recharts, dnd-kit

## Commands

```bash
bun run dev      # dev server
bun run build    # production build
bun run lint     # ESLint
```

## Project layout

```
src/
  app/
    auth/        # sign-in
    dashboard/   # metrics
    users/       # user management
    properties/      # property management
    bookings/    # booking management
    settings/    # account & notifications
  config/
    routes.tsx   # add new routes here
  components/
    app-sidebar.tsx   # nav links — add new pages here
  lib/
    api.ts       # shared axios → http://localhost:80, injects Bearer token
```

## Adding a page

1. Create `src/app/<feature>/page.tsx`
2. Add route in `src/config/routes.tsx`
3. Add nav item in `src/components/app-sidebar.tsx`
4. Add API hooks in `src/app/<feature>/api/hooks.ts`

## Key env vars

| Variable | Default | Description |
|---|---|---|
| `VITE_BASENAME` | `""` | Set to `/admin` in production |
