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

`AppRouter` wraps all non-public routes in `<ProtectedRoute>`. Auth state is determined by `useMe()` — if it returns no user, the route redirects to login.

The app is served under a configurable basename (`VITE_BASENAME` env var, e.g. `/admin` in production). Routes are always written relative to basename.

### API client

`src/lib/api.ts` — axios instance with base URL `http://localhost:80` (Traefik), `withCredentials: true`. The httpOnly `access_token` cookie is sent automatically — no manual token attachment. The 401 interceptor redirects to login for all requests **except** `/@me/` (prevents redirect loops on public pages when not logged in).

Auth hooks live in `src/app/auth/api/hooks.ts`. The pattern for other domains:
- co-locate `api/api-client.ts`, `api/hooks.ts`, `api/types.ts` inside the feature folder

### Auth flow (frontend side)

1. `POST /auth/token` (form-urlencoded) → server sets httpOnly `access_token` cookie; nothing stored in JS
2. `GET /users/@me/get` with `staleTime: Infinity`, always enabled — returns user data when authenticated, 401 when not
3. `ProtectedRoute` reads `useMe()` — redirects to login if unauthenticated
4. Logout: `POST /auth/logout` clears the cookie server-side + clears QueryClient cache

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

## Property form section architecture

Adding a section to the property form requires touching 4 places:
1. `components/sections/<name>-section.tsx` — section component (must have `id="section-<name>"`)
2. `components/property-form-nav.tsx` — add entry to `FORM_SECTIONS`
3. `use-section-completion.ts` — add key to `SectionStates`, return value in `computeSectionStates`
4. `components/property-form.tsx` — add any new props, render section after `<Separator />`

Sections outside the form schema (separate API calls) return `'untouched'` from section completion and must not be listed in `allRequiredComplete`. Pass `propertyId?` as a prop to enable edit-only sections (create mode shows a "save first" placeholder).

API client: `api` from `@/lib/api` (not `apiClient` — that name is used in brighter-frontend).

## Pricing — per-date calendar editor

Owners price the calendar **day by day** in `components/sections/dynamic-pricing-section.tsx` (an edit-only section, gated on `propertyId`). The calendar is the sole source of price and availability — there are no recurring weekday rules and no base price. A day with a price is bookable at that price; a day with no price is unavailable.

- **Data**: `useDatePrices(propertyId, from, to)` loads existing rows (`GET /pricing/dates`); the section keeps a local `Map<isoDate, price>` for editing.
- **Set a day / range**: pick a single day or a range and apply one price → `useSetDatePrices` calls `PUT /pricing/dates` `{start_date, end_date, price}` (one request upserts every night in the inclusive range).
- **Clear a day / range**: `useClearDatePrices` calls `DELETE /pricing/dates?start_date=&end_date=` → those nights become unpriced/unavailable.
- `price_from` and `has_valid_pricing` on the property are **system-owned** projections recomputed by properties-ms on every calendar write — never sent from the form.

Both hooks live in `src/app/properties/hooks.ts` and invalidate the property query on success.

## Adding a shadcn/ui component

```bash
bunx shadcn@latest add <component>
```

## Adding a new page

1. Create `src/app/<feature>/page.tsx`
2. Add a lazy import + route entry in `src/config/routes.tsx`
3. Add API hooks in `src/app/<feature>/api/hooks.ts` using the axios instance from `src/lib/api.ts`
4. Add a nav item in `src/components/app-sidebar.tsx`

## Testing

No test suite exists for this service. When adding tests, use vitest + `@testing-library/react` (consistent with brighter-frontend).

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `VITE_BASENAME` | `""` | Router basename — set to `/admin` when served behind Traefik |

## Git & Branch Workflow

- **Branch off `dev`**: all new work starts from `dev` — use `feat/<slug>` (or `fix/`, `chore/`, `test/`, `refactor/` as appropriate)
- **PR targets `dev`**: never push directly to `dev` or `main`
- **Approval required**: at least one human approval before merging
- **CI must be green**: all checks must pass before merging
- **Staging on green `dev`**: a passing `dev` triggers an automatic staging deployment
- **`dev` → `main` is manual**: when `dev` is stable and ready to ship, open a PR from `dev` to `main` and merge manually
- **Hotfixes bypass `dev`**: branch off `main` as `fix/<slug>`, PR directly to `main`, then backport to `dev`
- **Branch cleanup**: delete merged branches periodically — keep them for a while for reference, then clean up
