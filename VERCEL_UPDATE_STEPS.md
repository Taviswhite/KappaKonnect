# Fix Vercel Site Not Updating

## 1. Push the latest changes (run in your project folder)

```bash
git add vercel.json VERCEL_UPDATE_STEPS.md
git commit -m "Add explicit Vercel build config to fix deployment"
git push origin main
```

Wait 2–3 minutes, then check https://kappaconnect.vercel.app again.

---

## 2. If it still doesn’t update – check Vercel Dashboard

### A. Confirm GitHub is connected

1. Go to **https://vercel.com/dashboard**
2. Open your **kappaconnect** project
3. **Settings** → **Git**
4. Check:
   - **Connected Git Repository**: `Taviswhite/remix-of-crimson-connect`
   - **Production Branch**: `main`

### B. Check recent deployments

1. **Deployments** tab
2. See if the latest commit (e.g. “Add explicit Vercel build config”) has a deployment
3. If the latest deployment is **Failed** (red):
   - Open it and check **Build Logs**
   - Common causes: missing `VITE_SUPABASE_URL` or `VITE_SUPABASE_PUBLISHABLE_KEY` in **Settings → Environment Variables**

### C. Redeploy manually

1. **Deployments** tab
2. Click **…** on the latest deployment
3. **Redeploy**
4. Optionally uncheck **Use existing Build Cache** for a full rebuild

---

## 3. If it’s a cache issue (site works but looks old)

- Hard refresh: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
- Or try in an **Incognito/Private** window

---

## 4. Force a fresh deploy with an empty commit

If pushes don’t trigger new deployments:

```bash
git commit --allow-empty -m "Trigger Vercel redeploy"
git push origin main
```

---

## 5. Environment variables (if build fails)

In Vercel: **Settings → Environment Variables**, add for **Production** (and Preview if you use it):

| Name | Value |
|------|--------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon/public key |

Save, then redeploy from the **Deployments** tab.
