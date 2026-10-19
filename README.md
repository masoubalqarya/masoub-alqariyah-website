# Masoub AlQarya — Customer Website

Public **Next.js 16** website for **Masoub AlQarya** (معصوب القرية): marketing pages plus drive-through food ordering. Built with **JavaScript / JSX**, Tailwind CSS 4, and the Firebase client SDK.

Currency is always **Saudi Riyal (SAR / ر.س)**. Default UI is **Arabic RTL**; English LTR is toggleable.

Agent context: `[AGENTS.md](./AGENTS.md)`. Copilot / IDE shortcuts: `[.github/copilot-instructions.md](./.github/copilot-instructions.md)`.

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
| `/delete-account` | Account deletion request instructions                 |
| `/support`   | Customer support information and email contact              |


Guest checkout uses **Firebase Anonymous Auth**. A full email or Google account is required for `/orders`.

Privacy, deletion, and support pages are linked from the site footer. Customer and privacy requests are directed to `info@masoubalqariyah.com`.

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
