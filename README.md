# Mi Restaurante OS

Production-leaning multi-tenant restaurant operations SaaS built with **Next.js App Router + Supabase**.

## Features
- Multi-tenant restaurant isolation with strict `restaurant_id` scoping and Supabase RLS.
- Role-based access for `super_admin`, `manager`, `waiter`, `kitchen`, `cashier`.
- Tablet-optimized operational floor map.
- Visual floor layout editor (drag and position tables, shape support).
- Waiter flow: open table, add items, modifiers, notes, staged send-to-kitchen.
- Kitchen display system with real-time status updates.
- Checkout flow with payment methods and table release.
- Sales reports (day/hour/item/category/waiter + closed orders table).
- Settings and staff/role management.
- Audit logs and order status history.

## Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + shadcn-style UI components
- Supabase (Postgres/Auth/Realtime/RLS)
- Zod validation
- TanStack Table + Recharts for reports

## Project Structure
```txt
app/
  (auth)/login
  (app)/dashboard
  (app)/floor
  (app)/floor/editor
  (app)/orders/[tableId]
  (app)/menu
  (app)/menu/new
  (app)/assignments
  (app)/kitchen
  (app)/checkout
  (app)/reports
  (app)/settings
  (app)/staff
components/
lib/
  actions/
  queries/
  validators/
  supabase/
supabase/
  migrations/202603110001_init.sql
  seed.sql
```

## Environment Variables
Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (reserved for future admin operations)
- `NEXT_PUBLIC_APP_URL` (for local: `http://localhost:3000`)

## Local Setup
1. Install dependencies:
```bash
npm install
```

2. Set up Supabase project:
- Create a Supabase project.
- In SQL Editor, run migration file:
  - `supabase/migrations/202603110001_init.sql`
- Then run seed file:
  - `supabase/seed.sql`

3. Start app:
```bash
npm run dev
```

4. Login at `http://localhost:3000/login`.

## Demo Credentials
All demo users use password: `Demo1234!`

- Manager: `manager@demo-resto.com`
- Waiter 1: `waiter1@demo-resto.com`
- Waiter 2: `waiter2@demo-resto.com`
- Kitchen: `kitchen@demo-resto.com`
- Cashier: `cashier@demo-resto.com`
- Super Admin: `superadmin@demo-resto.com`

## Realtime
Enable Realtime for these tables in Supabase:
- `floor_tables`
- `orders`
- `order_items`

(Go to Database > Replication and add these tables to publication if needed.)

## Deploy to Vercel
1. Push repository to GitHub.
2. Import project in Vercel.
3. Configure environment variables in Vercel Project Settings.
4. Deploy.

## Production Notes
- Invite-based onboarding is prepared in data model (`restaurant_users`) but can be extended with explicit invite flow.
- Consider adding server-side audit views and report materialized views for high-volume traffic.
- Split payments are not implemented in MVP, but schema is ready to evolve (`payments` table can be expanded).

## QA Checklist (MVP)
- Login and role-based route access.
- Open floor and select a table.
- Add customized items with modifiers and notes.
- Send draft items to kitchen.
- Change item status in kitchen and verify waiter/floor updates.
- Close order with payment and verify table resets to available.
- Validate reports populate with seeded historical data.
