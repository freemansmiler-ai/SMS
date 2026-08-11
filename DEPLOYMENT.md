# Codivex Academy SMS - Production Deployment Guide

This guide details the step-by-step procedure for deploying the **Codivex Academy School Management System** to production using **Vercel** (or Netlify/Cloudflare) and **Supabase**.

---

## 📋 Pre-Deployment Checklist

- [x] Production Next.js Turbo build verification (`npm run build` succeeds)
- [x] Zero TypeScript compilation errors (`npx tsc --noEmit`)
- [x] Security headers configured in `next.config.ts` (HSTS, Frame Options, XSS protections)
- [x] Protected server middleware active on all `/admin`, `/principal`, `/teacher`, `/student`, `/dashboard` routes
- [x] Multi-tenant database RLS policies & privilege triggers enabled

---

## 🚀 1. Database Setup in Supabase

1. Log into your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project (or create a new production project).
3. Open the **SQL Editor** tab.
4. Execute the schema migration script:
   * Copy the content of [`supabase/migrations/20260808000000_initial_schema.sql`](file:///C:/Users/User/Desktop/Learn/SMS/supabase/migrations/20260808000000_initial_schema.sql) and click **Run**.
5. Execute the Row Level Security (RLS) script:
   * Copy the content of [`supabase/migrations/20260808000001_auth_and_rls.sql`](file:///C:/Users/User/Desktop/Learn/SMS/supabase/migrations/20260808000001_auth_and_rls.sql) and click **Run**.

---

## 🔑 2. Environment Variables Configuration

Set the following environment variables in your deployment platform (Vercel / Netlify / Railway):

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public (Client & Server) | Your Supabase project URL (e.g. `https://xxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public (Client & Server) | Your Supabase publishable key |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (Client & Server) | Your Supabase anon JWT key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-Only (Secret)** | Your Supabase service role key (Never expose to client!) |

---

## 🌐 3. Deploying to Vercel

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the project into **Vercel** (`https://vercel.com/new`).
3. Select **Next.js** framework preset.
4. Add the environment variables listed above under **Environment Variables**.
5. Click **Deploy**.

---

## 👤 4. Initial Administrator Account Provisioning

After deployment or configuring your environment variables:

Run the server-side provisioning script to generate your primary Administrator account:

```bash
ADMIN_EMAIL="admin@your-school.edu.gh" ADMIN_PASSWORD="YourSecureStrongPassword123!" npx tsx scripts/provision-admin.ts
```

### Production Admin Setup
* **Portal URL**: `https://your-domain.com/login`
* **Email**: Set via `ADMIN_EMAIL` during provisioning
* **Password**: Set via `ADMIN_PASSWORD` during provisioning (User should change password on initial sign-in)

---

## 🛡️ 5. Post-Deployment Verification

1. **Sign-In Verification**: Visit `/login` and sign in with the Administrator credentials.
2. **Role Isolation Check**: Verify that users cannot navigate to unauthorized role routes.
3. **Session Persistence & Logout**: Click **Log out** from the user menu to confirm session destruction and redirect to `/login`.
