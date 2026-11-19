# Masoub AlQarya — Customer Website

Public **Next.js 16** website for **Masoub AlQarya** (معصوب القرية): marketing pages plus drive-through food ordering. Built with **JavaScript / JSX**, Tailwind CSS 4, and the Firebase client SDK.

Currency is always **Saudi Riyal (SAR / ر.س)**. Default UI is **Arabic RTL**; English LTR is toggleable.

Agent context: `[AGENTS.md](./AGENTS.md)`. Copilot / IDE shortcuts: `[.github/copilot-instructions.md](./.github/copilot-instructions.md)`.

## Pickup and car service

Customers can choose car service or pickup inside the selected branch in the mobile app and website. Pickup skips car details and uses the order number for collection. Orders share `fulfillmentType` (`driveThrough` or `pickup`); older orders remain car service. For pickup, the existing `onTheWay` status is shown as **Ready for pickup** and `delivered` as **Collected**. The admin portal and POS show the method and matching actions, and POS receipt/kitchen tickets identify branch pickup.

## Companion repos (same Firebase)


| App                                              | Path                                            |
| ------------------------------------------------ | ----------------------------------------------- |
| Admin panel (menu CRUD, POS, **security rules**) | `D:\Dev\Web\clients\masoub-alqarya-admin-panel` |
| Mobile app (Expo)                                | `D:\Dev\React Native\clients\masoub-alqarya`    |


---



## Features


| Route        | Description                                                 |
| ------------ | ----------------------------------------------------------- |
| `/`          | Home — hero, how ordering works, featured offers, locations |
| `/menu`      | Full menu, categories, search, offers                       |
| `/item?id=`  | Item customisation (size, cooking, extras)                  |
| `/offer?id=` | Offer detail → cart                                         |
| `/cart`      | Cart + restaurant selection                                 |
| `/checkout`  | Car plate, card/cash, place order                           |
| `/track?id=` | Live order status                                           |
| `/orders`    | Order history (signed-in account)                           |
| `/account`   | Sign in / sign up / Google                                  |
| `/locations` | Restaurant locations                                        |
| `/about`     | About                                                       |
| `/privacy`   | Bilingual privacy policy                                    |
| `/terms`     | Terms and conditions for the website and mobile app         |
| `/delete-account` | Account deletion request instructions                 |
| `/support`   | Customer support information and email contact              |


Guest checkout uses **Firebase Anonymous Auth**. A full email or Google account is required for `/orders`.

Privacy, terms, deletion, and support pages are linked from the site footer. Customer and privacy requests are directed to `info@masoubalqariyah.com`.

---



## Tech stack

- **Framework:** Next.js 16 (App Router, React 19, JS/JSX)
- **Path alias:** `@/`* → `./src/`* (`jsconfig.json`)
- **Styling:** Tailwind CSS 4
- **Fonts:** Cairo (Arabic) + Lato (English)
- **Backend:** Firebase Auth, Firestore, Storage — `src/lib/firebase.js`
- **Icons:** Lucide React

---



## Getting started



### Prerequisites

- Node.js 18+ and npm
- Access to the Masoub AlQarya Firebase project



### 1. Install & run

```bash
cd masoub-alqarya-website
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 2. Firebase configuration

Web config is initialized in `src/lib/firebase.js`. Point that file at the correct project before running locally.

### 3. Firebase Console (required for checkout)

In [Firebase Console](https://console.firebase.google.com/) → **Authentication**:

1. Enable **Anonymous** sign-in (guest checkout on this site and the mobile app)
2. Enable **Email/Password** and **Google** (accounts)
3. Add this site’s domain (and `localhost`) under **Settings → Authorized domains**

Deploy Firestore rules from the **admin panel** repo (`firestore.rules`). Customers without a staff `users/{uid}` doc must not fail rule evaluation; creating customers can read their own orders (`userId == auth.uid`).

```bash
# from the admin panel repo
firebase deploy --only firestore:rules,storage
```

---



## Project structure

```
src/
├── app/                 # App Router pages
├── components/          # Header, Footer, cards, banners
├── hooks/               # Auth, cart, menu, restaurants
├── lib/
│   ├── firebase.js      # Firebase init
│   ├── auth.js          # Anonymous + email + Google
│   ├── orders.js        # createOrder (matches mobile)
│   ├── i18n/            # en.js / ar.js
│   └── utils.js         # formatSAR, localStorage keys
└── types/index.js       # JSDoc domain models
```

---



## Deploy to Vercel

1. Push this repo to GitHub (or another Git host)
2. Import the project in [Vercel](https://vercel.com)
3. Confirm Firebase config in `src/lib/firebase.js` (or migrate to env vars and set them in Vercel)
4. After deploy, add the Vercel domain to Firebase **Authorized domains**

```bash
npm i -g vercel
vercel
```

---



## Currency

All monetary values are in **SAR (ر.س)**. Use `formatSAR()` from `src/lib/utils.js` in the UI.

---



## License

Private — Masoub AlQarya.

## Order notes and daily receipt numbers

Checkout supports optional notes (up to 500 characters), visible to staff and on receipts/kitchen tickets. New order numbers are assigned by the shared Firebase callable, starting at **1 per branch each Saudi calendar day**. Mobile and web share the sequence; retries and reprints keep the original number. This requires deployment of `submitCustomerOrder` and a coordinated customer-client/rules rollout; source changes alone do not activate it.

## Stock, featured catalog, and POS release

Manage shared stock in Admin Menu (or POS Settings as an admin). Featured items and their rank are configured in Admin Menu and shown first in customer menus. Unavailable items/offers cannot be checked out; the server validates stock again. Regular mobile products require sizes; fixed offers use admin-configured sizes, while percentage offers let customers choose sizes and calculate the discounted total. POS paid orders require verified payment records; cash orders wait for a cashier to start preparation. Category routing supports several printers, including the first receipt printer, with one full receipt and routed kitchen copies. Updated client/backend rollout is required; no builds/deployments are run automatically.

## Offer pricing models

Offers use the existing `offers` collection with `items: [{menuItemId, nameEn, nameAr, sizeId, qty}]` and `pricingType: "fixed" | "percentage"` (default fixed). Fixed bundles use a positive `offerPrice` below the regular total and require admin-configured sizes (`null` for unsized products). Percentage offers use numeric `discountPercent` greater than 0 and less than 100, with up to two decimals; row `sizeId` is null and customers explicitly choose any attached size. The discount applies only to configured products/quantities, including chosen size prices and default cooking additions; extras and unrelated cart items are excluded. One size choice covers the full row quantity. Catalog per-item size additions override global additions. Percentage `offerPrice`/`originalPrice` are derived starting-price snapshots, never authoritative checkout inputs. Listings and incomplete selections show "From" prices using the cheapest remaining sizes; they do not preselect sizes in the form. Customers must complete required choices before adding.

The pure offer-pricing helper is mirrored in admin/mobile/web and checked against the POS shared implementation by focused tests. Percentage rates use integer basis points; each single-bundle total is rounded to the nearest halala, then multiplied by bundle quantity. Largest-remainder allocation splits a configured row into at most two unit-price lines where needed. Cart/order lines carry `offerId`, a distinct `offerGroupId`, `offerQty`, and `offerLineIndex`. Group quantity changes scale every constituent. `offerSizeChoices` recovers one consistent size per row from split lines for server validation and reorder. Size, cooking, and extra snapshots include stable IDs.

`submitCustomerOrder` re-reads offers, products, sizes and extras in the order/counter transaction, validates complete active groups, configured discount rates, and exact quantities/options/prices, and writes canonical snapshots/totals. Ordinary catalog prices are also verified so removing offer metadata cannot retain discounted prices. Stale/tampered carts fail with `failed-precondition` and `{reason: "cart-changed"}` before receipt allocation; clients explain how to remove/re-add affected lines. Reorders use current pricing and reject unavailable offers. Update the callable and customer/admin clients together; no rules/collection changes, dependencies, builds, or deployments are implied. This is the development contract, with no legacy fallback or data migration.

## Admin content and catalog presentation

- Admin `/app-settings` edits the mobile homepage hero and independent iOS/Android disabled, optional or forced store-update policies in `appSettings/mobile`. The app prompts only versions below the configured target; optional prompts can be dismissed, while forced prompts block app use. Enter a valid platform store URL and a published target version before enabling a policy. The release version comes from mobile `app.json` (`expo.version`).
- Admin Menu/Offers support image drops and handle/arrow gallery reordering (first image is the cover), category images, drag-and-drop category/product ordering, and editable Arabic/English size names. Mobile/web details show image carousels and share category and product ordering. Categories and their products follow saved positions, with natural Arabic name tie-breaks; featured products have their own order and section on the app homepage. Mobile receives these catalog updates live.
- Manual setup remains: publish the reviewed shared Firestore/Storage rules when authorized, release the changed clients, then enter hero content, gallery/category images, positions and store policies in admin. Rules sources are synchronized with POS. No dependencies, builds, deployments or live settings changes were made.

See [AGENTS.md](./AGENTS.md#admin-content-and-catalog-presentation) for fields, caching, security paths and rollout details.

Admin Menu ? Arrange menu controls category and product order through handles/arrows and Save order. Product positions are independent of featured placement; the mobile homepage has a separate featured section. The shared ordering helper uses natural Arabic names for ties, so display-language changes do not reshuffle the catalog.

## Cash orders and operational updates

Customer checkout is cash-only; online payment is informational. Customers/branch cashiers can edit quantities, notes and car details or cancel during the first 60 seconds before preparation. Active admins can correct/cancel later with a reason and immutable before/after history. The shared callables enforce ownership, branch, timing, revisions and print fences; direct client order updates are denied by the synchronized rules. Prepared-order edits require staff review and an explicit audited reprint.

Source changes do not deploy services or rules. Review the shared callable/rules/client rollout together when authorized. No builds, deployments, live changes or hardware acceptance were performed. See AGENTS.md for the contract and device limits.
