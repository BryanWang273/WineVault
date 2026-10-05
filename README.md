# WineVault

A full-stack wine marketplace with an aging tracker. Browse a catalogue, add bottles to a cart and check out, then follow each bottle in your cellar against an estimated drinking window and keep tasting notes. An admin area covers managing wines and orders.

Built with Next.js 15, React 19, TypeScript, Tailwind CSS and Supabase (auth, Postgres, storage). The app lives in [`wine-marketplace/`](wine-marketplace).

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

In the Supabase SQL Editor, run these in order on a fresh project:

1. The `wines` and `tracked_wines` tables and their policies. This SQL lives in the comment block at the bottom of [`wine-marketplace/lib/supabase.ts`](wine-marketplace/lib/supabase.ts).
2. `supabase-rls-policy.sql` (write policies for `wines`)
3. `sql/create-users-table.sql`
4. `sql/create-profiles-table.sql` (also creates the `user-content` storage bucket for avatars)
5. `sql/create-orders-table.sql`, then `sql/fix-admin-orders-access.sql` (the final set of `orders` policies)
6. `reset-purchased-wines-table.sql`
7. `sql/admin-role-policies.sql` (run this last: it replaces the earlier "any signed-in user" policies with admin-only ones)

The other `.sql` files are earlier iterations kept for reference: `supabase-setup.sql`, `update-tracked-wines-schema.sql`, `sql/ensure-orders-insert-policy.sql`, `sql/ensure-tracked-wines-schema.sql`, `sql/fix-orders-rls-policy.sql` and `sql/orders-rls-policy.sql`. The SQL accumulated during development, so these scripts were not run as a single migration.

### 4. Create the image bucket

In Supabase Storage, create a **public** bucket named `wine-images`; the admin area uploads wine photos there. Admins also need permission to upload to it (this uses the `is_admin()` function created by the previous step):

```sql
create policy "Admins can upload wine images"
on storage.objects for insert to authenticated
with check (bucket_id = 'wine-images' and public.is_admin());
```

### 5. Add some wines

The catalogue is read from the `wines` table and there is no seed script. Add wines from the admin area (`/admin/wines/new`, which needs an admin account; see [Creating an admin account](#creating-an-admin-account)) or insert rows yourself. [`wine-marketplace/data/wines.ts`](wine-marketplace/data/wines.ts) holds nine sample wines in the app's shape that you can adapt.

### 6. Run it

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
