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

Next.js **App Router** **customer website** for **Masoub AlQarya** (معصوب القرية) in Saudi Arabia. Hybrid **marketing site + car-service/pickup ordering**: browse the menu, pick a restaurant, customize items, choose collection inside the branch or delivery to the car, pay (card/cash), and track the order in real time.

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

## Minimal validation — no builds

- Use the smallest check that verifies the change. For documentation-only or cosmetic changes, review the diff; do not run lint, typecheck, or tests.
- For code changes, start with existing editor diagnostics for changed files. Run a targeted lint check or relevant existing test only when needed. Run typecheck only when the change needs type validation; it is not mandatory for every task.
- Do not automatically run full-repository lint, full test suites, integration/emulator suites, Expo Doctor, dependency installation, or repeated checks. Broaden checks only for a concrete unresolved issue or an explicit user request.
- **Do not run builds for validation:** no app/web/production/native/backend builds, EAS builds, `expo prebuild`, or bundle exports. Run a build only when the user explicitly requests building or shipping as the task itself.
- Stop after the minimal relevant check passes. Report what was checked and any material limitation; do not fix unrelated baseline failures.

## Routes

| Route | File | Purpose |
| --- | --- | --- |
| `/` | `src/app/page.jsx` | Marketing home — hero, how it works, featured offers, locations |
| `/menu` | `src/app/menu/page.jsx` | Categories, search, items, offers |
| `/item` | `src/app/item/page.jsx` | Item detail + sizes/cooking/extras → cart (`?id=`) |
| `/offer` | `src/app/offer/page.jsx` | Offer detail → cart (`?id=`) |
| `/cart` | `src/app/cart/page.jsx` | Cart review + restaurant; continue to checkout |
| `/checkout` | `src/app/checkout/page.jsx` | Pickup/car-service choice, conditional car details, payment, place order (guest via anonymous auth) |
| `/track` | `src/app/track/page.jsx` | Live status via `onSnapshot` (`?id=` Firestore doc id) |
| `/orders` | `src/app/orders/page.jsx` | Order history / reorder — **full account required** |
| `/account` | `src/app/account/page.jsx` | Email/password + Google; profile / sign out |
| `/locations` | `src/app/locations/page.jsx` | Restaurant list |
| `/about` | `src/app/about/page.jsx` | About |
| `/privacy` | `src/app/privacy/page.jsx` | Public bilingual privacy policy |
| `/terms` | `src/app/terms/page.jsx` | Public bilingual terms and conditions for the website and mobile app |
| `/delete-account` | `src/app/delete-account/page.jsx` | Account deletion request instructions via support email |
| `/support` | `src/app/support/page.jsx` | Customer support guidance and email contact |

Root layout: `src/app/layout.jsx` — Cairo/Lato, RTL default. `providers.jsx` wraps Auth → I18n → Cart → `SiteShell` (header, pending-order banner, footer).

Public information pages use `src/components/PublicInfoPage.jsx` for a shared RTL-safe layout and direct customers to `info@masoubalqariyah.com`. Footer links expose the privacy, terms, deletion, and support routes. `/terms` covers use of both the customer website and mobile app.

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
- **Public information pages:** `PublicInfoPage` renders localized policy/support sections and the shared support email action for `/privacy`, `/terms`, `/delete-account`, and `/support`.
- **Money / orders:** `formatSAR`, `statusColors` in `src/lib/utils.js`.
- **Types:** update JSDoc in `src/types/index.js` when changing data shapes.
- **Cart merge:** same item with different `selectedSize` / `selectedCookingOption` / `selectedExtras` stays as separate lines (`src/hooks/useCart.jsx`).
- **Menu helpers:** `src/lib/menuDefaults.js` — cheapest size, default cooking, size price add, option summaries.

### Order contract (`createOrder`)

Pickup is shared across all four clients, including the [POS](../masoub-alqarya-pos/AGENTS.md). `fulfillmentType` is `driveThrough` or `pickup`; missing means legacy car service. Checkout offers both methods. Pickup does not require car details and the order writer clears all three vehicle fields even if the browser remembers a car; it does not overwrite saved car preferences. [src/lib/fulfillment.js](./src/lib/fulfillment.js) normalizes the payload and maps order-aware status labels. Keep it aligned with the mobile helper. Pickup uses the chosen branch and order number for collection.

The stored pipeline stays unchanged: `onTheWay` displays **Ready for pickup**, and `delivered` displays **Collected** for pickup orders. Track, history, and pending banners use these labels; pickup instructions replace stay-in-car copy. Admin/POS actions and POS printed tickets use the same contract. This additive field uses the same Firebase project and needs no new collection or rules deployment.

Must stay aligned with mobile `src/firebase/orders.js`:

- `orderNumber`, `plateNumber`, `carColor`, `carModel`
- `fulfillmentType` (`driveThrough` | `pickup`); vehicle strings are empty for pickup
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
| `orders` | Create through authenticated `submitCustomerOrder` (including anonymous); read own (`userId == auth.uid`) for tracking/history |
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

## Customer notes and daily receipt numbers

Checkout accepts optional notes (500 characters), preserves them on failure, and includes trimmed `orders.notes`. Tracking/history show them; admin/POS views and receipts/kitchen tickets retain them. Pickup Arabic and matching English copy cover collection inside the branch as well as car service.

[src/lib/orders.js](./src/lib/orders.js) calls authenticated `submitCustomerOrder` in the existing Firebase project (`europe-west1`, POS Functions codebase) instead of adding an order directly. It returns `{id, orderNumber, orderDate, notes}`. The callable atomically creates the order and increments `orderCounters/{restaurantId}__{YYYY-MM-DD}`: start at 1 per branch each Saudi calendar day (Asia/Riyadh, midnight UTC+3). Mobile and web share the sequence. Existing orders and reprints keep their numbers. Never generate a number on the client.

[src/lib/order-submission.js](./src/lib/order-submission.js) persists the original pending request in localStorage under `pending-order-v1:{uid}`, replays it after an uncertain response, and coalesces concurrent submissions. Confirmation or a definitive server rejection clears it; optional preference writes after confirmation must not fail checkout. Deploy the callable before releasing updated clients, then coordinate the server-only order-create rules cutover so old clients are not unexpectedly blocked.

## Stock, featured items, payment release, and printer routing

The shared catalog uses `menuItems.inStock` (missing means true), `isFeatured` (missing means false), and `featuredRank` (lowest first among featured items). Admin Menu provides a stock toggle plus featured/rank controls in item editing. Stock is global across branches. POS Settings lets active admins and cashiers update global stock through `posAction/setItemStock`. Cashiers must act through their assigned branch; the callable changes availability only, not prices, featured status, or other catalog fields. Mobile and web receive live stock updates, label unavailable products, block adding/checkout, and check offer constituents. The customer callable re-reads stock in its order/counter transaction; unavailable or removed items are rejected before allocating a receipt number. Existing accepted orders are still fulfilled. Both customer menus sort featured items first, including category-filtered views.

Regular mobile products require customer size selection. Offers support `pricingType: "fixed" | "percentage"` (default fixed). Fixed bundles use admin-configured `items[].sizeId`; percentage offers use `discountPercent` and customer-selected attached sizes on mobile/web. One size choice applies to the full configured row quantity. The regular total includes the selected sizes and default cooking options. `addOfferItems(offer, menuItems, sizeOptions, selectedSizes)` creates a distinct group; the optional fourth argument maps offer-row indices to customer size IDs for percentage offers. Integer-halala allocation preserves exact totals. Reorder restores valid percentage size choices and rebuilds current pricing; unavailable offers require menu review. No legacy offer/order migration is provided during development.

POS automatic processing requires a server-issued verified `posPayments/{orderId}` proof matching branch, SAR amount, content binding and fingerprint. Card selection alone is not payment verification. Cash orders stay pending until a cashier/admin explicitly transitions them to preparing, then queued printing can run; that action does not claim cash has been collected. Paid receipt success starts preparation, and no physical print is automatically retried after dispatch uncertainty.

POS `Config.routing` saves category-to-printer-ID arrays and reads legacy single strings. All enabled printers, including the first/cashier printer, can be selected per category. A category may target several printers. Receipt printers always receive one full receipt; kitchen printers receive their routed items once. Removing/disabling one destination retains the others; changing a printer template does not remove category membership. Roll out the updated POS client and callable together. No deployment or hardware verification is implied by source changes.

## Offer pricing models

Offers use the existing `offers` collection with `items: [{menuItemId, nameEn, nameAr, sizeId, qty}]` and `pricingType: "fixed" | "percentage"` (default fixed). Fixed bundles use a positive `offerPrice` below the regular total and require admin-configured sizes (`null` for unsized products). Percentage offers use numeric `discountPercent` greater than 0 and less than 100, with up to two decimals; row `sizeId` is null and customers explicitly choose any attached size. The discount applies only to configured products/quantities, including chosen size prices and default cooking additions; extras and unrelated cart items are excluded. One size choice covers the full row quantity. Catalog per-item size additions override global additions. Percentage `offerPrice`/`originalPrice` are derived starting-price snapshots, never authoritative checkout inputs. Listings and incomplete selections show "From" prices using the cheapest remaining sizes; they do not preselect sizes in the form. Customers must complete required choices before adding.

The pure offer-pricing helper is mirrored in admin/mobile/web and checked against the POS shared implementation by focused tests. Percentage rates use integer basis points; each single-bundle total is rounded to the nearest halala, then multiplied by bundle quantity. Largest-remainder allocation splits a configured row into at most two unit-price lines where needed. Cart/order lines carry `offerId`, a distinct `offerGroupId`, `offerQty`, and `offerLineIndex`. Group quantity changes scale every constituent. `offerSizeChoices` recovers one consistent size per row from split lines for server validation and reorder. Size, cooking, and extra snapshots include stable IDs.

`submitCustomerOrder` re-reads offers, products, sizes and extras in the order/counter transaction, validates complete active groups, configured discount rates, and exact quantities/options/prices, and writes canonical snapshots/totals. Ordinary catalog prices are also verified so removing offer metadata cannot retain discounted prices. Stale/tampered carts fail with `failed-precondition` and `{reason: "cart-changed"}` before receipt allocation; clients explain how to remove/re-add affected lines. Reorders use current pricing and reject unavailable offers. Update the callable and customer/admin clients together; no rules/collection changes, dependencies, builds, or deployments are implied. This is the development contract, with no legacy fallback or data migration.
