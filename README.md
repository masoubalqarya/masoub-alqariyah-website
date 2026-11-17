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

Manage shared stock in Admin Menu (or POS Settings as an admin). Featured items and their rank are configured in Admin Menu and shown first in customer menus. Unavailable items/offers cannot be checked out; the server validates stock again. The mobile app requires explicit sizes, including offer constituents. POS paid orders require verified payment records; cash orders wait for a cashier to start preparation. Category routing supports several printers, including the first receipt printer, with one full receipt and routed kitchen copies. Updated client/backend rollout is required; no builds/deployments are run automatically.
