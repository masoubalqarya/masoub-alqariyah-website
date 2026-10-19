# AGENTS.md — Masoub AlQarya Customer Website

Living project context for AI agents. Keep this file accurate; prefer it over stale assumptions.

## Mandatory maintenance

**After every change you make in this repository, update `AGENTS.md` in the same turn** so it stays consistent with the codebase.

Update whenever your work affects any of the following (non-exhaustive):

- Routes / pages / navigation
- Auth (anonymous guest checkout, email/password, Google)
- Firestore fields, order payload, or Storage usage
- Hooks, cart persistence, or shared utilities
- i18n structure or RTL/LTR conventions
- Tech stack, scripts, or project layout
- Domain models (`src/types/index.js`)
- Integrations with the admin panel or mobile app

Also update [`README.md`](./README.md) when the change is user-facing or structural (new pages, setup steps, collections, deploy notes). Also update [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) when architecture or conventions change. Do not leave README, AGENTS.md, and Copilot instructions conflicting.

If a change is purely cosmetic with no behavioral or structural impact, a docs update is optional — when unsure, update.

## What this is

Next.js **App Router** **customer website** for **Masoub AlQarya** (معصوب القرية) in Saudi Arabia. Hybrid **marketing site + drive-through ordering**: browse the menu, pick a restaurant, customize items, enter car plate details, pay (card/cash), and track the order in real time.

Backend is the **same Firebase project** as the admin panel and mobile app (Auth, Firestore, Storage). Currency is always **SAR (ر.س)**. Default UI locale is **Arabic RTL**; English LTR is toggleable.

## Companion admin panel

| | |
| --- | --- |
| **Repo path** | `D:\Dev\Web\clients\masoub-alqarya-admin-panel` |
| **Agent docs** | `AGENTS.md` in that repo (open via multi-root workspace) |
| **Copilot docs** | `.github/copilot-instructions.md` in that repo |
| **Owns** | Menu/offers/restaurants CRUD, staff roles, POS status updates, **`firestore.rules` / `storage.rules`** |
| **Shared contract** | Firestore collections + order status pipeline below |

## Companion mobile app

| | |
| --- | --- |
| **Repo path** | `D:\Dev\React Native\clients\masoub-alqarya` |
| **Agent docs** | `AGENTS.md` in that repo (open via multi-root workspace) |
| **Copilot docs** | `.github/copilot-instructions.md` in that repo |
| **Owns** | Native customer ordering UI, cart, car plate, payment, Track Order |
| **Shared contract** | Website `src/lib/orders.js` `createOrder` must match mobile `src/firebase/orders.js` |

When changing order fields, statuses, menu shapes, or security rules: update **all three** repos’ docs and keep payloads compatible with admin `src/types/index.js`, mobile `src/firebase/orders.js`, and this site’s `src/lib/orders.js`.

**Rules live only in the admin repo.** Do not invent a second `firestore.rules` here. For guest checkout to work, **Anonymous Auth** and **Google** sign-in must be enabled in the Firebase console, and the website domain must be added to **Authentication → Settings → Authorized domains**.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (`src/app`), React 19 |
| Language | **JavaScript / JSX** — no TypeScript sources; types live as JSDoc in `src/types/index.js` |
| Paths | `@/*` → `./src/*` (`jsconfig.json`) |
| Styling | Tailwind CSS 4 (`src/app/globals.css`) |
| Brand | Warm earthy primary ≈ `#8A776F`; accent clay; Cairo (AR) + Lato (EN) via `next/font` |
| Data | Firebase client SDK (`src/lib/firebase.js` — web config currently hardcoded) |
| Icons | Lucide React |
| Utils | `clsx` + `tailwind-merge` via `cn()` in `src/lib/utils.js` |

Scripts: `npm run dev` | `build` | `start` | `lint`

## Routes

| Route | File | Purpose |
| --- | --- | --- |
| `/` | `src/app/page.jsx` | Marketing home — hero, how it works, featured offers, locations |
| `/menu` | `src/app/menu/page.jsx` | Categories, search, items, offers |
| `/item` | `src/app/item/page.jsx` | Item detail + sizes/cooking/extras → cart (`?id=`) |
| `/offer` | `src/app/offer/page.jsx` | Offer detail → cart (`?id=`) |
| `/cart` | `src/app/cart/page.jsx` | Cart review + restaurant; continue to checkout |
| `/checkout` | `src/app/checkout/page.jsx` | Car plate, payment, place order (guest via anonymous auth) |
| `/track` | `src/app/track/page.jsx` | Live status via `onSnapshot` (`?id=` Firestore doc id) |
| `/orders` | `src/app/orders/page.jsx` | Order history / reorder — **full account required** |
| `/account` | `src/app/account/page.jsx` | Email/password + Google; profile / sign out |
| `/locations` | `src/app/locations/page.jsx` | Restaurant list |
| `/about` | `src/app/about/page.jsx` | About |
| `/privacy` | `src/app/privacy/page.jsx` | Public bilingual privacy policy |
| `/delete-account` | `src/app/delete-account/page.jsx` | Account deletion request instructions via support email |
| `/support` | `src/app/support/page.jsx` | Customer support guidance and email contact |

Root layout: `src/app/layout.jsx` — Cairo/Lato, RTL default. `providers.jsx` wraps Auth → I18n → Cart → `SiteShell` (header, pending-order banner, footer).

Public information pages use `src/components/PublicInfoPage.jsx` for a shared RTL-safe layout and direct customers to `info@masoubalqariyah.com`. Footer links expose all three routes.

### Typical order flow

`/` or `/menu` → `/item` or `/offer` → `/cart` → `/checkout` → `/track`

### Auth

- **Guest checkout:** `ensureAuth()` in `src/lib/auth.js` signs in **anonymously** if there is no current user. `createOrder` calls `ensureAuth()` itself and writes `userId` from that session. Mobile uses the same pattern in `src/firebase/auth.js` / `src/firebase/orders.js`.
- **Full account:** email/password + Google (`signInWithPopup`). Sign-up / Google writes `customers/{uid}` (not staff `users`). Anonymous users are not written to `customers`.
- `/orders` requires a **non-anonymous** account (`isFullAccount`). Guests can still track via `/track?id=` and the header last-order link (`LAST_ORDER_KEY` in localStorage; Header re-reads it on pathname change).

Staff profiles (`users` with `admin` / `cashier` / `user`) are owned by the admin panel.

## Architecture patterns

- **Client-heavy:** pages and hooks are `"use client"`. Live menu/restaurants/orders via Firestore `onSnapshot`.
- **Data layer:**
  - `useAuth` — Firebase user + `ensureAuth` / sign-in helpers
  - `useCart` — cart + selected restaurant in localStorage (`maq_cart_v1`, `maq_saved_restaurant`)
  - `useMenu` — categories, items, active offers, sizes, extras, allergies
  - `useRestaurants` — locations
  - `src/lib/orders.js` — `createOrder` (calls `ensureAuth()`), `subscribeToOrder`, `fetchUserOrders`
- **i18n:** `src/lib/i18n/` — dictionaries `en.js` / `ar.js`. Default **Arabic RTL**. Use logical CSS (`start`/`end`/`ms`/`me`/`border-e`), not raw `left`/`right`. Add **both** EN and AR strings for any new UI copy.
- **Public information pages:** `PublicInfoPage` renders localized policy/support sections and the shared support email action for `/privacy`, `/delete-account`, and `/support`.
- **Money / orders:** `formatSAR`, `generateOrderNumber`, `statusColors` in `src/lib/utils.js`.
- **Types:** update JSDoc in `src/types/index.js` when changing data shapes.
- **Cart merge:** same item with different `selectedSize` / `selectedCookingOption` / `selectedExtras` stays as separate lines (`src/hooks/useCart.jsx`).
- **Menu helpers:** `src/lib/menuDefaults.js` — cheapest size, default cooking, size price add, option summaries.

### Order contract (`createOrder`)

Must stay aligned with mobile `src/firebase/orders.js`:

- `orderNumber`, `plateNumber`, `carColor`, `carModel`
- `paymentMethod` (`card` | `cash`), `cashAmount`, `changeAmount`, `needsChange`
- `restaurantId`, `restaurantName` (locale-aware: AR prefers `nameAr`, EN prefers `nameEn`, with fallback)
- `estimatedTime`, `status: "pending"`, `userId`
- Line items: `itemId`, `nameEn`/`nameAr`, `price`, `quantity`, optional `selectedSize` / `selectedCookingOption` / `selectedExtras`, optional offer group fields, `subtotal`
- `total`, `createdAt`, `updatedAt` (`serverTimestamp`)

### Order statuses (shared)

`pending` → `preparing` → `onTheWay` → `delivered` | `cancelled`

- Website **creates** `pending` orders.
- Admin / POS **advances** status (and may write `statusHistory`).
- Track UI (`/track`, `PendingOrderBanner`) listens with `subscribeToOrder` / `onSnapshot`.

## Firestore collections (website usage)

| Collection | Website role |
| --- | --- |
| `categories`, `menuItems`, `sizeOptions`, `extrasOptions`, `allergiesOptions` | Read (menu) |
| `offers` | Read active (`isActive == true`) |
| `restaurants` | Read (selection / locations) |
| `orders` | Create (authenticated, including anonymous); read own (`userId == auth.uid`) for track & history |
| `customers` | Write on full-account sign-up / Google (`customers/{uid}`) |

Security rules and Storage paths live in the **admin panel** repo (`firestore.rules`, `storage.rules`). Staff helpers there use `userExists()` so customers without a `users/{uid}` doc do not fail rule evaluation.

## Conventions for agents

1. **Keep `AGENTS.md`, Copilot instructions, and README in sync** — see Mandatory maintenance above.
2. **Stay in JS/JSX** — do not convert the project to TypeScript unless explicitly asked.
3. **Match existing style** — functional components, domain hooks, Lucide icons, Tailwind utilities.
4. **Bilingual + RTL** — every user-facing string in `en.js` and `ar.js`; keep layout RTL-safe.
5. **Preserve order contract** — field names in `createOrder` must stay admin- and mobile-compatible.
6. **Firebase** — use `auth` / `db` / `storage` from `@/lib/firebase`. Prefer `onSnapshot` for live lists.
7. **Secrets** — do not commit `.env.local` or private keys; config is already in-repo for this Firebase web app.
8. **Scope** — change only what the task needs; avoid drive-by refactors.
9. **Admin awareness** — menu/offer/restaurant content is managed in the admin panel; this site is a consumer + order creator.
10. **Console setup** — anonymous auth + Google + authorized domains are required for checkout/sign-in; rules must be deployed from the admin repo.

## Key files

```
src/app/                 # Routes + layout + providers + globals.css
src/components/          # SiteShell, Header, Footer, cards, banners
src/hooks/               # useAuth, useCart, useMenu, useRestaurants
src/lib/firebase.js      # Firebase init
src/lib/auth.js          # Anonymous, email, Google, customers/{uid}
src/lib/orders.js        # createOrder / subscribe / fetchUserOrders
src/lib/i18n/            # Locale provider + dictionaries
src/lib/utils.js         # cn, SAR, order helpers, localStorage keys
src/lib/menuDefaults.js  # Size/cooking/option helpers
src/types/index.js       # JSDoc domain models
AGENTS.md                # This file — update after each agent change
.github/copilot-instructions.md
README.md                # Human-facing docs — keep aligned with AGENTS.md
```
