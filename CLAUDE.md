# CLAUDE.md — brighter-admin-panel

React SPA admin dashboard for managing users, properties, and platform data (part of BrighterProject).

## Running

```bash
bun run dev      # Vite dev server (port 5173 by default)
bun run build    # production build
bun run lint     # ESLint
```

## Architecture

### Tech stack

- **Router**: React Router DOM v7 — flat route config in `src/config/routes.tsx`
- **Data fetching**: TanStack Query v5
- **Forms**: React Hook Form + Zod
- **State**: Zustand (global), React Context for sidebar/theme
- **Styling**: Tailwind 4 + shadcn/ui
- **Charts**: Recharts
- **DnD**: dnd-kit
- **Runtime**: Vite + bun

### Project structure

```
src/
  app/                  # Feature pages, co-located by domain
    auth/               # sign-in, forgot-password + API hooks/types
    dashboard/          # metrics, tables (active)
    users/              # user management (active)
    properties/             # property management (active)
    bookings/           # booking management (active)
    settings/           # account, notifications (active)
    errors/             # 401/403/404/500/maintenance pages
    calendar/           # (inactive, commented out)
    chat/               # (inactive, commented out)
  components/
    router/
      app-router.tsx    # renders route tree; splits protected vs public
      protected-route.tsx
    ui/                 # shadcn/ui components + custom
    theme-provider.tsx
  config/
    routes.tsx          # route definitions — add new routes here
  contexts/             # sidebar-context, theme-context
  hooks/                # use-mobile, use-theme, etc.
  lib/
    api.ts              # shared axios instance → http://localhost:80
  types/
  utils/
```

### Routing and auth guard

Routes are defined in `src/config/routes.tsx` as a flat array:

```ts
{ path: "/dashboard", element: <Dashboard /> }                  // protected (default)
{ path: "/auth/sign-in", element: <SignIn />, isPublic: true }  // public
```

`AppRouter` wraps all non-public routes in `<ProtectedRoute>`. Auth state is `localStorage.getItem("access_token")`.

The app is served under a configurable basename (`VITE_BASENAME` env var, e.g. `/admin` in production). Routes are always written relative to basename.

### API client

`src/lib/api.ts` — axios instance with base URL `http://localhost:80` (Traefik). Attaches `Authorization: Bearer <token>` from localStorage on every request.

Auth hooks live in `src/app/auth/api/hooks.ts`. The pattern for other domains:
- co-locate `api/api-client.ts`, `api/hooks.ts`, `api/types.ts` inside the feature folder

### Auth flow (frontend side)

1. `POST /auth/token` (form-urlencoded) → stores `access_token` in `localStorage`
2. `GET /users/@me/get` with `staleTime: Infinity` to hydrate current user on load
3. Logout: removes token from localStorage + clears QueryClient cache

### Role-based access

Two roles access the admin panel: **admins** (full access) and **property owners** (restricted).

| Page | Admin | Property Owner |
|---|---|---|
| Dashboard | ✓ | ✓ |
| Users | ✓ | hidden |
| Properties | ✓ (all) | ✓ (own only) |
| Bookings | ✓ (all) | ✓ (own only) |
| Settings | ✓ | ✓ |

Role detection uses `src/lib/scopes.ts` — helpers that inspect the current user's `scopes` array (loaded from `GET /users/@me/get`). The sidebar conditionally hides the Users nav item for property owners.

```ts
isAdmin(scopes: string[])       // true if any scope starts with "admin:"
isPropertyOwner(scopes: string[])  // true if has "properties:me" and is NOT admin
```

Property owners cannot change property status (button hidden). Admins can escalate any user to property owner via the Users page scope management UI.

## Adding a shadcn/ui component

```bash
bunx shadcn@latest add <component>
```

## Adding a new page

1. Create `src/app/<feature>/page.tsx`
2. Add a lazy import + route entry in `src/config/routes.tsx`
3. Add API hooks in `src/app/<feature>/api/hooks.ts` using the axios instance from `src/lib/api.ts`
4. Add a nav item in `src/components/app-sidebar.tsx`

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `VITE_BASENAME` | `""` | Router basename — set to `/admin` when served behind Traefik |
