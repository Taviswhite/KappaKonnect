# Security & Health Check

## Checks run (as of last review)

| Check | Status |
|-------|--------|
| `npm run type-check` | Pass |
| `npm run lint` | Pass (0 errors, 9 non-blocking warnings) |
| `npm run build` | Pass |

---

## npm audit – dependency vulnerabilities

**Current:** 0 vulnerabilities.

- **Vite** upgraded to ^7.3.1 (fixes esbuild GHSA-67mh-4wv8-2f99).
- **tar** override to ^7.5.4 (fixes GHSA-8qq5-rm4j-mr97, GHSA-r6q2-hw4h-h46w) via `overrides` in `package.json`; @capacitor/cli remains at ^8.

---

## Security measures in place

- **`.gitignore`** – `.env`, `.env.local`, `config.json` are not committed.
- **`vercel.json`** – Security headers: X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, X-XSS-Protection, Referrer-Policy, Permissions-Policy, Content-Security-Policy.
- **`vercel.json`** – Redirects for `/.env`, `/.git`, `/config.json`, `/package.json`, `/api/debug` to 404.
- **`.vercelignore`** – Excludes sensitive and unneeded files from deployment.
- **Client-side** – `src/lib/threat-detection.ts` and `/blocked` for URL-based threat checks.
- **Supabase** – Use RLS and least-privilege for all tables.

---

## Re-run checks

```bash
npm audit
npm run type-check
npm run lint
npm run build
```
