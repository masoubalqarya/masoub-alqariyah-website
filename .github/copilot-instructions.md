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
| `/privacy` | Bilingual privacy policy |
| `/terms` | Terms and conditions for the website and mobile app |
| `/delete-account` | Account deletion request instructions |
| `/support` | Customer support and email contact |

Layout: `providers.jsx` → Auth → I18n → Cart → `SiteShell`.

`PublicInfoPage` provides the shared RTL-safe layout for the public privacy, terms, deletion, and support routes. Their footer links and support actions use `info@masoubalqariyah.com`.

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

## Pickup and car-service contract

All four clients use the same Firebase project and `orders.fulfillmentType` (`driveThrough` or `pickup`); missing means existing car service. Pickup skips car entry, writes empty vehicle fields, and identifies collection inside the selected branch by order number. Saved car preferences are preserved. Stored statuses stay unchanged: pickup `onTheWay` displays Ready for pickup and `delivered` displays Collected. Staff actions, customer tracking/history/banners, and POS receipts/kitchen tickets reflect the method. POS print-content checks include it. Keep all four repositories compatible; no new collection or rules deployment is required for this additive field.

## Notes and receipt numbering

Customer orders carry optional trimmed `notes` (max 500 characters). Both customer clients now use authenticated `submitCustomerOrder` in the shared Firebase project / POS Functions codebase. The server creates the order and assigns `orderNumber` from a branch/day counter starting at 1 at Saudi midnight; `orderDate` identifies the day. Clients preserve an idempotent pending request until confirmation (or definitive rejection) and never generate random numbers or write orders directly. Rules deny direct creates/counter access; coordinate callable deployment, updated clients, and rules cutover. Existing receipt numbers and reprints remain unchanged. See [AGENTS.md](../AGENTS.md) for current contracts and rollout requirements.

## Stock, featured items, payment release, and printer routing

The shared catalog uses `menuItems.inStock` (missing means true), `isFeatured` (missing means false), and `featuredRank` (lowest first among featured items). Admin Menu provides a stock toggle plus featured/rank controls in item editing. Stock is global across branches. POS Settings lets admins update stock through `posAction/setItemStock`; branch cashiers can view it but cannot change global catalog availability. Mobile and web receive live stock updates, label unavailable products, block adding/checkout, and check offer constituents. The customer callable re-reads stock in its order/counter transaction; unavailable or removed items are rejected before allocating a receipt number. Existing accepted orders are still fulfilled. Both customer menus sort featured items first, including category-filtered views.

The mobile product screen starts with no size selected and blocks adding until the customer chooses a valid attached size. Offer details require a choice for every sized constituent; `addOfferItems` takes a fourth `selectedSizes` map keyed by offer-line index. Each added offer group is distinct so different size choices never merge. Reorder may reuse a previously selected size; legacy lines lacking a size open product selection instead of choosing a default. Cooking defaults remain unchanged. Website size behavior is unchanged.

POS automatic processing requires a server-issued verified `posPayments/{orderId}` proof matching branch, SAR amount, content binding and fingerprint. Card selection alone is not payment verification. Cash orders stay pending until a cashier/admin explicitly transitions them to preparing, then queued printing can run; that action does not claim cash has been collected. Paid receipt success starts preparation, and no physical print is automatically retried after dispatch uncertainty.

POS `Config.routing` saves category-to-printer-ID arrays and reads legacy single strings. All enabled printers, including the first/cashier printer, can be selected per category. A category may target several printers. Receipt printers always receive one full receipt; kitchen printers receive their routed items once. Removing/disabling one destination retains the others; changing a printer template does not remove category membership. Roll out the updated POS client and callable together. No deployment or hardware verification is implied by source changes.
