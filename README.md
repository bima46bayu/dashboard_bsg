# Atlas — Management Dashboard

A unified business-intelligence dashboard implementing the **Management Dashboard PRD v1.0** as a frontend-only application with mock data. The visual language is inspired by the Cryptech reference: clean light theme, generous whitespace, soft rounded cards, accent-color KPI tiles, and a top navigation pill.

> Cloud, integrations, auth, and backend layers from the PRD are **intentionally out of scope** for this build.

## Modules

| # | Module             | Page                  |
|---|--------------------|-----------------------|
| – | Dashboard overview | `/`                   |
| 1 | Sales              | `/sales`              |
| 2 | Inventory          | `/inventory`          |
| 3 | Project            | `/project`            |
| 4 | Profitability      | `/profitability`      |
| 5 | Asset              | `/asset`              |
| 6 | Document           | `/document`           |
| 7 | Digital Marketing  | `/marketing`          |
| 8 | Reporting          | `/reporting`          |

Each page surfaces module-specific KPIs (4 stat cards), at least one chart, and one data table — all populated with deterministic mock data so visuals stay stable across reloads.

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS v3
- Recharts (charts, sparklines)
- Lucide React (icons)
- React Router

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173 — you will be redirected to the **login** page.

**Default credentials** (after `npm run db:migrate` in `server/`):

| Email | Password |
|---|---|
| `admin@atlas.local` | `admin123` |

Change the password in production by updating the `users` table or adding a change-password flow.

## Project layout

```
src/
  App.tsx                  router
  main.tsx                 entry
  index.css                Tailwind layers + design tokens
  components/
    layout/                Header, TopNav, PageShell
    ui/                    StatCard, Sparkline, AreaChartCard, BarChartCard, DonutChart, Gauge, DataTable, Card, Badge
  data/mock.ts             deterministic series helpers
  lib/                     utilities (cn, formatters)
  pages/                   one .tsx per module + DashboardPage
```

## Design tokens

Defined in `tailwind.config.js` under `theme.extend.colors`:

- `bg.base` — warm canvas
- `bg.surface` — card white
- `accent.lime / mint / sky / peach / rose` — KPI tile accents
- `ink / ink.soft / ink.muted / ink.faint` — text scale

## PostgreSQL (Project Monitoring API)

Monitoring data (People & Partners, Projects) can use **PostgreSQL** via the `server/` API.

### Local setup

1. **Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)** (easiest way to run Postgres).

2. **Start PostgreSQL:**

```bash
docker compose up -d
```

3. **Configure the API:**

```bash
cd server
copy .env.example .env
npm install
```

4. **Run API + frontend** (two terminals):

```bash
# Terminal 1 — API
cd server
npm run dev

# Terminal 2 — frontend (project root)
copy .env.example .env
npm run dev
```

5. **Check:** open `http://localhost:3001/api/health` → `{"ok":true,"database":"connected"}`

Without `VITE_API_URL` in the root `.env`, the app uses **localStorage** (static hosting on Plesk only).

### Plesk (production)

1. **Databases** → Add Database → PostgreSQL → note host, db name, user, password.
2. Run `server/migrations/001_init.sql` in **phpPgAdmin** or Plesk DB admin.
3. Host the API with **Plesk Node.js** (or a small VPS) and set `DATABASE_URL`.
4. Build frontend with `VITE_API_URL=https://api.bsggroup.online` (your API URL).
5. Upload `dist/` to `httpdocs` as before.

Atlas dashboard modules (Sales, Inventory, …) still use mock data until those APIs exist.

## WhatsApp Promo (Wablas v2 API)

`/marketing/whatsapp` sends real WhatsApp broadcasts through your Wablas device.

1. Sign in to your [Wablas dashboard](https://solo.wablas.com) → **Device → Settings** and copy the **Token** and **Secret Key**.
2. In `server/.env` set:

```env
WABLAS_BASE_URL=https://solo.wablas.com
WABLAS_TOKEN=your_token_here
WABLAS_SECRET_KEY=your_secret_key_here
WABLAS_SENDER=6281xxxxxxxxx        # optional, shown in the UI
```

3. Restart the API (`npm run dev` in `server/`).
4. Open `/marketing/whatsapp`:
   - Pick recipients from **People & Partners** or paste numbers (`08123… | Name`).
   - Personalize with `{{name}}`.
   - **Send** — frontend POSTs to `/api/whatsapp/send`, the server forwards to
     `POST https://solo.wablas.com/api/v2/send-message` with the `Authorization: {token}.{secret_key}` header. Tokens stay on the server.

Limits: Wablas v2 accepts up to **100 messages** per request. Local broadcast history is kept in the browser.

## Notes

- Charts use Recharts; sparklines use a single shared `Sparkline` component.
- The `Gauge` is a hand-built SVG (no extra dependency).
- Without PostgreSQL, monitoring data is stored in the browser (localStorage).
