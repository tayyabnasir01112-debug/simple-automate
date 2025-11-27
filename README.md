# SimpleAutomate

SimpleAutomate is a lightweight SaaS CRM that combines contact management, drag-and-drop pipelines, marketing automations, bulk email campaigns, and subscription billing. The stack is intentionally lean so it can run comfortably on the free tiers for Netlify (frontend), Render (backend + cron), and Neon (Postgres).

## Tech Stack

- **Frontend:** Vite + React 18, TypeScript, TailwindCSS, React Router, React Query, Helmet
- **Backend:** Node 20, Express, Prisma, Stripe, Resend, JWT auth with refresh cookies
- **Database:** Neon PostgreSQL (free tier friendly schema)
- **Automation:** Render Cron hits `/api/cron/run` with a shared secret
- **Payments:** Stripe Checkout + webhooks for subscription lifecycle

## Monorepo Layout

```
simpleautomate/
├── client/         # React app (Netlify)
├── server/         # Express API (Render)
├── prisma/         # Prisma schema & seed script
├── scripts/        # CLI helpers for Netlify/Render/Neon
├── render.yaml     # Render blueprint (API + cron job)
└── config/env.sample  # Reference env vars for both apps
```

## Local Development

> **Node.js:** Vite 7 requires Node 20.19+ (or 22.12+). Upgrade your local runtime before running the steps below.

1. **Install dependencies**
   ```bash
   cd simpleautomate
   npm install --prefix client
   npm install --prefix server
   ```

2. **Configure env vars**
   - Duplicate `config/env.sample` to `.env` files in your favourite secret manager.
   - For local dev, set:
     ```
     DATABASE_URL=postgresql://postgres:postgres@localhost:5432/simpleautomate
     FRONTEND_URLS=http://localhost:5173
     APP_BASE_URL=http://localhost:4000
     JWT_ACCESS_SECRET=local-access
     JWT_REFRESH_SECRET=local-refresh
     CRON_SECRET=local-cron
     VITE_API_URL=http://localhost:4000/api
     VITE_APP_URL=http://localhost:5173
     ```

3. **Start services**
   ```bash
   # Terminal 1
   cd server
   npm run dev

   # Terminal 2
   cd client
   npm run dev
   ```

## Database & Prisma

- `prisma/schema.prisma` defines every table and enum.
- Generate client: `cd server && npx prisma generate`
- Apply migrations (once Neon is provisioned):
  ```bash
  cd server
  npx prisma migrate deploy
  ```
- Seed demo data locally: `npm run seed` (creates `demo@simpleautomate.co.uk / DemoPass123!`).

## Deployment Automation

### Netlify (frontend)
```powershell
pwsh scripts/deploy-netlify.ps1 -SiteName "<netlify-site-name>" -Team "<optional-team>"
```
The script logs in, builds `client/`, sets `VITE_*` env vars (if present), and runs `netlify deploy --prod`.

### Render (backend + cron)
1. Update the `repo` fields inside `render.yaml` with your GitHub repo.
2. Run:
   ```powershell
   pwsh scripts/deploy-render.ps1
   ```
3. After the web service is live, set `API_BASE_URL` for the cron job to the external URL of the API and re-run the blueprint.

### Neon database
```powershell
pwsh scripts/bootstrap-neon.ps1 -ProjectName "simpleautomate"
```
The script walks you through `neonctl` auth, creates a project/branch, and prints a production `DATABASE_URL`. Use that in Render and in local `.env` overrides.

## Background Automations

- Render Cron job (defined in `render.yaml`) curls `POST /api/cron/run` every 15 minutes with `CRON_SECRET`.
- The API processes automation queues, scheduled campaigns, and task reminders whenever that endpoint is hit. You can also invoke it manually:
  ```bash
  curl -X POST "$API_URL/api/cron/run" \
       -H "Content-Type: application/json" \
       -d "{\"secret\":\"$CRON_SECRET\"}"
  ```

## Testing Checklist

- `npm run build` inside both `client/` and `server/`
- Create a new user, verify email, log in/out
- Create contacts, drag pipeline stages, create tasks/notes
- Build automation with multiple steps and trigger by adding a contact
- Save email templates, create a campaign (immediate + scheduled)
- Stripe Checkout -> verify subscription status updates after webhook

## Secrets to Collect

When you're ready to go live, you'll need:

- GitHub repo URL (for Render blueprint)
- Netlify auth + site name
- Render auth (`render login`)
- Neon auth token (for `neonctl`)
- Stripe keys + Price ID + webhook secret
- Resend API key
- `CRON_SECRET` shared across API + cron job

Keep everything in a password manager or `.env` files that never hit git.

