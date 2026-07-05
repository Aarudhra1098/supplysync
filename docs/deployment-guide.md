# 🚀 SupplySync AI - Deployment Guide

This document explains how to deploy the SupplySync AI monorepo to production. The project consists of a Next.js frontend (deployed on Vercel) and an Express.js backend API (deployed on Render, Railway, or Heroku).

---

## 1. Database (Supabase)

Your database is already hosted on Supabase and is production-ready. 

**Connection Strings needed for deployment:**
*   **Transaction Pooler (Port 6543):** Used for runtime application queries.
*   **Direct Connection (Port 5432):** Used only when running Prisma migrations (`npx prisma db push` or `npx prisma migrate deploy`).

---

## 2. Deploying the Backend API (`services/api`)

Vercel is designed for frontends and serverless functions, so you need a separate platform (like **Render**, **Railway**, or **Heroku**) to run the Express API server permanently.

### Example using Render.com:
1. Create an account on [Render.com](https://render.com) and click **New → Web Service**.
2. Connect your GitHub repository (`Anuragreddy4/supplysync`).
3. Fill in the build settings:
   *   **Root Directory:** `services/api`
   *   **Build Command:** `pnpm install --no-frozen-lockfile && npx prisma generate`
   *   **Start Command:** `pnpm start`
4. Add the following **Environment Variables** (copy values from `services/api/.env`):
   *   `DATABASE_URL` (The pooled one, port 6543)
   *   `DIRECT_URL` (The direct one, port 5432)
   *   `FIREBASE_ADMIN_PROJECT_ID`
   *   `FIREBASE_ADMIN_CLIENT_EMAIL`
   *   `FIREBASE_ADMIN_PRIVATE_KEY`
   *   `GEMINI_API_KEY`
   *   `PORT` (Set to `4000` or let Render choose one)
5. Click **Deploy Web Service**.
6. Once deployed, copy the Render URL (e.g., `https://supplysync-api.onrender.com/api`). You will need this for the frontend!

---

## 3. Deploying the Frontend (`apps/web`)

You have already successfully deployed the frontend to Vercel. Now we need to connect it to the production backend.

### Setting up Vercel:
1. Go to your project on the [Vercel Dashboard](https://vercel.com).
2. Go to **Settings → General → Root Directory** and ensure it is set to `apps/web`.
3. Go to **Settings → Environment Variables** and add the variables from your `apps/web/.env.local`:
   *   `NEXT_PUBLIC_FIREBASE_API_KEY`
   *   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   *   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   *   `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   *   `NEXT_PUBLIC_API_BASE_URL` ➡️ **IMPORTANT:** Set this to your live backend URL (e.g., `https://supplysync-api.onrender.com/api`). DO NOT use `localhost`.
   *   `NEXT_PUBLIC_API_URL` ➡️ Same as above.
4. Go to the **Deployments** tab, click the three dots (`...`) on your latest deployment, and click **Redeploy** so the new environment variables take effect.

---

## 4. Final Verification

1. Open your live Vercel URL.
2. Ensure you can navigate to the `/login` page.
3. Perform a login. The frontend will communicate with your live Render backend to verify the token and establish the session.
4. If login works, the full stack is successfully deployed!
