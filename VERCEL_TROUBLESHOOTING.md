# Vercel Deployment Troubleshooting

## Issue: "Nothing is showing" / Blank Page

### Most Common Causes:

1. **Missing Environment Variables** ⚠️ MOST LIKELY
2. Build failed
3. Deployment still in progress
4. Browser cache issue

---

## Step 1: Check Vercel Deployment Status

1. Go to **Vercel Dashboard** → **Your Project** → **Deployments**
2. Check the latest deployment:
   - ✅ **Ready** = Deployment successful
   - ⏳ **Building** = Still deploying (wait)
   - ❌ **Error** = Build failed (check logs)

---

## Step 2: Check Build Logs

If deployment shows **Error**:

1. Click on the failed deployment
2. Click **View Build Logs**
3. Look for errors like:
   ```
   Missing required environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
   ```

---

## Step 3: Add Environment Variables (CRITICAL)

**Your app REQUIRES these environment variables to work:**

1. Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. Add these variables for **ALL environments** (Production, Preview, Development):

   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

3. **Where to find these values:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Navigate to **Settings** → **API**
   - Copy:
     - **Project URL** → `VITE_SUPABASE_URL`
     - **anon/public key** → `VITE_SUPABASE_PUBLISHABLE_KEY`

4. **After adding variables:**
   - Click **Save**
   - Go to **Deployments** tab
   - Click **⋯** (three dots) on latest deployment → **Redeploy**

---

## Step 4: Verify Deployment Configuration

Check that Vercel detected your project correctly:

1. **Vercel Dashboard** → **Your Project** → **Settings** → **General**
2. Verify:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install` (or leave default)

---

## Step 5: Check Browser Console

If the site loads but shows blank page:

1. Open your Vercel URL
2. Press **F12** (or right-click → Inspect)
3. Go to **Console** tab
4. Look for errors like:
   ```
   Missing env.VITE_SUPABASE_URL
   Missing env.VITE_SUPABASE_PUBLISHABLE_KEY
   ```

---

## Step 6: Clear Browser Cache

Sometimes old cached files cause issues:

1. **Hard refresh:** `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Or clear cache:
   - Chrome: Settings → Privacy → Clear browsing data → Cached images and files
   - Firefox: Settings → Privacy → Clear Data → Cached Web Content

---

## Step 7: Force Redeploy

If nothing works, force a new deployment:

1. **Vercel Dashboard** → **Deployments**
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Or make a small change and push:
   ```bash
   git commit --allow-empty -m "Force redeploy"
   git push origin main
   ```

---

## Quick Checklist

- [ ] Environment variables added in Vercel dashboard
- [ ] Variables set for **ALL environments** (Production, Preview, Development)
- [ ] Deployment shows **Ready** status
- [ ] No errors in build logs
- [ ] Browser console shows no errors
- [ ] Hard refreshed the page

---

## Still Not Working?

1. **Check Vercel Status:** https://vercel-status.com
2. **Check Build Logs:** Look for specific error messages
3. **Test Locally:** Run `npm run build` locally to see if it works
4. **Contact Support:** Share the error message from build logs

---

## Expected Behavior

Once everything is configured correctly:
- ✅ Site loads at your Vercel URL
- ✅ Login page appears
- ✅ No console errors
- ✅ Can navigate between pages
