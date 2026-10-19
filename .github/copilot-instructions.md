# Masoub AlQarya Customer Website — GitHub Copilot Instructions

Companion to [`AGENTS.md`](../AGENTS.md). Prefer AGENTS.md for living project context; keep both files aligned when architecture changes.

## Project overview

Next.js **App Router** customer website for **Masoub AlQarya** (معصوب القرية). Hybrid marketing + drive-through ordering. Firebase (Auth, Firestore, Storage). Currency **SAR**. Default UI **Arabic RTL**; English LTR toggleable.

**Companion admin panel:** `D:\Dev\Web\clients\masoub-alqarya-admin-panel` — menu CRUD, POS, **`firestore.rules`**.  
**Companion mobile app:** `D:\Dev\React Native\clients\masoub-alqarya` — native ordering. Same Firebase; `createOrder` in `src/lib/orders.js` must match mobile `src/firebase/orders.js`.

Anonymous Auth + Google must be enabled in the Firebase console; add the website domain to authorized domains. Do not add a second rules file here.

## Tech stack

- Next.js 16 (`src/app`), React 19, **JavaScript / JSX** (JSDoc in `src/types/index.js`)
- Path alias `@/*` → `./src/*` (`jsconfig.json`)
- Tailwind CSS 4 · Cairo + Lato · Lucide React · `clsx` / `tailwind-merge`
- Firebase client: `src/lib/firebase.js`

Scripts: `npm run dev` | `build` | `start` | `lint`

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Marketing home |
| `/menu` | Menu + offers |
| `/item?id=` | Item customisation |
| `/offer?id=` | Offer → cart |
| `/cart` | Cart + restaurant |
| `/checkout` | Plate, payment, place order (guest via anonymous auth) |
| `/track?id=` | Live status |
| `/orders` | History — **full account required** |
| `/account` | Email / Google auth |
| `/locations` | Locations |
| `/about` | About |

Layout: `providers.jsx` → Auth → I18n → Cart → `SiteShell`.

## Architecture

- Client-heavy `"use client"` pages; live data via `onSnapshot`
- Hooks: `useAuth`, `useCart`, `useMenu`, `useRestaurants`
- Orders: `src/lib/orders.js` — `createOrder` (calls `ensureAuth()`), `subscribeToOrder`, `fetchUserOrders`
- Auth: `src/lib/auth.js` — `ensureAuth()` (anonymous), email, Google; full accounts write `customers/{uid}`
- i18n: `src/lib/i18n/` (`en.js` / `ar.js`); logical CSS (`start`/`end`)
- Cart + restaurant persist in localStorage (`src/lib/utils.js` keys)
- Header re-reads `LAST_ORDER_KEY` on pathname change

### Order statuses (do not rename)

`pending` → `preparing` → `onTheWay` → `delivered` | `cancelled`

Website creates `pending`. Admin/POS advances status. `/track` and `PendingOrderBanner` subscribe to the same docs.

## Firestore (website)

| Collection | Role |
| --- | --- |
| Menu catalogs, `offers`, `restaurants` | Read |
| `orders` | Authenticated create; read own (`userId == auth.uid`) |
| `customers` | Write on full-account sign-up |

Rules owned by the admin repo. Staff helpers use `userExists()` so missing `users/{uid}` does not deny customers.

## Conventions

1. Keep `AGENTS.md` and this file in sync
2. Stay JS/JSX unless asked otherwise
3. Both locale files for every UI string; RTL-safe layout
4. Keep `createOrder` compatible with mobile + admin
5. Use `@/lib/firebase` shared instances
6. Do not commit private keys
7. Scoped diffs only
