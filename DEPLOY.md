# Coolify Deployment Guide

This document explains the one-time setup in the Coolify UI so the League
app starts cleanly and **keeps its data across redeploys**.

## 1. Environment variables

In Coolify → Application → **Environment Variables**, add:

| Key | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | SQLite inside the container. |
| `NEXTAUTH_URL` | `https://sp.buu.ro` | Public URL, no trailing slash. |
| `NEXTAUTH_SECRET` | `<random 32+ char string>` | Generate with `openssl rand -base64 32` or `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. |
| `ADMIN_EMAIL` | `<your email>` | Optional. If set together with `ADMIN_PASSWORD`, an admin user is created on first run. |
| `ADMIN_PASSWORD` | `<strong password, min 8 chars>` | Optional. Required only if `ADMIN_EMAIL` is set. |
| `ADMIN_NAME` | `Site Admin` | Optional display name. |
| `SEED_DEMO` | `1` or `0` | Default: `1` when no admin is configured, `0` when admin env vars are set. |

## 2. Persistent storage (CRITICAL)

Without persistent storage, the SQLite database is wiped on every redeploy.

Coolify → Application → **Persistent Storage** → **+ Add**:

| Field | Value |
|---|---|
| Path | `/app/prisma` |
| Size | `1GB` (more than enough for SQLite + small seed) |

This keeps `dev.db` (and any future SQLite files) across container restarts.

## 3. Build pack

Coolify detects Next.js automatically. The current setup uses **Railpack**,
which runs `npm run build` then `npm start`.

`package.json` is already wired so:

- `npm run build` runs `prisma generate && next build`.
- `npm start` runs `prisma db push --skip-generate && node server.js` via
  `scripts/bootstrap.sh`.

If you ever switch back to a plain Dockerfile build, the existing
`Dockerfile` already runs `npx prisma db push && node server.js` in its CMD.

## 4. First login

- If you set `ADMIN_EMAIL` + `ADMIN_PASSWORD`, log in with those.
- Otherwise, the demo user `demo@leaguehub.local` / `demo12345` is created
  on first run. **Change the password immediately** (the user can be
  deleted/recreated by removing the persistent volume, but the demo password
  is a known public default).

## 5. Updating the app

1. `git push origin main`
2. Coolify redeploys automatically.
3. The bootstrap script re-runs `prisma db push` (idempotent — only applies
   schema changes, never wipes data).
4. The admin user is re-checked (skipped if it already exists).

## 6. Wiping data

To reset everything (users, championships, matches):

1. Coolify → Application → **Danger Zone** → **Restart** (or stop and start
   to force a fresh container).
2. Coolify → Application → **Persistent Storage** → remove `/app/prisma`.
3. Redeploy.

The bootstrap script will recreate the schema and seed either your admin or
the demo user on the next start.
