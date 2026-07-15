This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started..

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Web Push Notifications

Generate VAPID keys once:

```bash
npx web-push generate-vapid-keys
```

Add these environment variables:

```bash
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_SUBJECT=mailto:you@example.com
```

`NEXT_PUBLIC_VAPID_PUBLIC_KEY` is still supported for existing deployments, but
new deployments should use `VAPID_PUBLIC_KEY` so the API route reads the key from
the server environment at runtime.

Create the Supabase table used for browser subscriptions:

```sql
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  subscription jsonb not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

create policy "Users can read their push subscriptions"
  on public.push_subscriptions
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their push subscriptions"
  on public.push_subscriptions
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their push subscriptions"
  on public.push_subscriptions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their push subscriptions"
  on public.push_subscriptions
  for delete
  using (auth.uid() = user_id);
```

Create the delivery log used to avoid repeated task reminders:

```sql
create table if not exists public.push_notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  notification_type text not null,
  notification_date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, notification_type, notification_date)
);

alter table public.push_notification_deliveries enable row level security;
```

Task reminder pushes are sent by calling the cron endpoint:

```bash
curl -X POST https://your-domain.com/api/push/tasks \
  -H "Authorization: Bearer your_cron_secret"
```

Add one of these server environment variables for the endpoint secret:

```bash
TASK_REMINDER_SECRET=your_cron_secret
# or
CRON_SECRET=your_cron_secret
```

The endpoint sends one daily due-soon summary for incomplete tasks due today or
tomorrow, and one daily missed-task summary for incomplete tasks overdue before
today. Dates are evaluated in `Asia/Karachi`.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
