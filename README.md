# WineVault

A full-stack wine marketplace with an aging tracker. Browse a catalogue, add bottles to a cart and check out, then follow each bottle in your cellar against an estimated drinking window and keep tasting notes. An admin area covers managing wines and orders.

Built with Next.js 15, React 19, TypeScript, Tailwind CSS and Supabase (auth, Postgres, storage). The app lives in [`wine-marketplace/`](wine-marketplace).

## Live demo

**https://winevault-seven.vercel.app**: sign-up is open, so you can create an account and try the cart, checkout (simulated payment) and the aging tracker. It runs on free hosting (Vercel and a free Supabase project), so the first visit can be slow. The admin area isn't available in the demo.

## Features

- **Catalogue**: search, sort and category filters (red, white, sparkling), plus detail pages with tasting notes, food pairings, aging potential and storage advice.
- **Cart and checkout**: a two-step checkout (shipping, then payment). Payment is **simulated**; no payment provider is integrated.
- **Accounts**: email and password sign-up and login through Supabase Auth, and a profile page with avatar upload.
- **Aging tracker**: add bottles manually or from your purchases. Each tracked bottle gets an estimated drinking window (start, peak, end), an Aging or Ready status, a progress bar and tasting notes. Purchased wines land in your collection and can be moved into the tracker.
- **Purchase history**: a page listing past purchases grouped by order.
- **Admin area** (`/admin`): create, edit and delete wines (with image upload) and review and update the status of orders.

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| UI | Tailwind CSS, Radix UI primitives via shadcn/ui, lucide-react icons |
| Backend | Supabase: Auth, Postgres (with Row Level Security) and Storage |
| Server logic | Next.js server actions for tracker mutations |

## Project structure

```
wine-marketplace/
  app/          Next.js routes (wines, wine/[id], cart, checkout, tracker, profile, purchase-history, admin/...)
  components/   Shared UI: header, footer, route guard, shadcn/ui components in components/ui
  lib/          Supabase client, auth / cart / shop / tracker contexts, server actions
  data/         Sample wine data in the app's shape (not imported by the app)
  sql/, *.sql   Supabase schema and policy scripts
  __tests__/    Test files (not wired into an npm script yet)
```

## Getting started

### Prerequisites

- Node.js 18.18 or newer, and npm
- A [Supabase](https://supabase.com) project (the free tier is enough)

### 1. Install

```bash
cd wine-marketplace
npm install
```

The repo includes an `.npmrc` with `legacy-peer-deps=true`, because `react-day-picker@8` does not declare React 19 support yet. Without it, npm stops with an `ERESOLVE` error.

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in the values from your Supabase project (Project Settings, then API):

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your project URL, e.g. `https://your-project-ref.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The `anon` public key (never the `service_role` key) |

`.env.local` is git-ignored, so real keys are never committed. If either variable is missing, the app stops at startup with a message saying which one to set.

### 3. Set up the database

Open the Supabase **SQL Editor**, paste the whole contents of [`wine-marketplace/sql/fresh-setup.sql`](wine-marketplace/sql/fresh-setup.sql), and click **Run**. It is safe to run more than once. It creates:

- the `wines`, `tracked_wines`, `users`, `profiles`, `orders` and `purchased_wines` tables
- Row Level Security policies: customers can only see and change their own data, and only admins can edit wines or see all orders
- the `wine-images` and `user-content` storage buckets, with admin-only uploads for wine photos
- nine sample wines (ids 1 to 4 are linked from the home page)

The other `.sql` files in `wine-marketplace/` and `wine-marketplace/sql/` are earlier iterations kept for reference. You don't need to run them.

### 4. Add more wines (optional)

The nine sample wines are enough to browse. To add more, use the admin area at `/admin/wines/new`, which needs an admin account; see [Creating an admin account](#creating-an-admin-account).

### 5. Run it

```bash
npm run dev
```

Open <http://localhost:3000>. Other scripts: `npm run build`, `npm start`, `npm run lint`.

### Creating an admin account

A user counts as an admin when their Supabase `app_metadata` contains `{"role": "admin"}`. Users can't edit `app_metadata` themselves, and the policies in `sql/admin-role-policies.sql` check the same claim. Sign up normally, then run this in the SQL Editor:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
where email = 'you@example.com';
```

Sign out and back in so your session picks up the new role.

## Known limitations

This is a demo project, not a production shop.

- **Payments are simulated.** Checkout waits two seconds and then records the order.
- **Notifications are not implemented.** The home page mentions drink-window alerts, but nothing sends them yet.
- **Drinking windows are rough estimates** calculated from the vintage year (and price, for purchased wines), not expert data.
- **Purchase history** reads the `purchased_wines` table, which checkout does not write to. Checkout records an `orders` row and adds the bought wines to your collection instead.
- **Admin access relies on `sql/admin-role-policies.sql`.** The admin screens are hidden in the browser, but the real enforcement is the database policies. If you skip that script, the earlier scripts let any signed-in user modify wines and view or update all orders.
