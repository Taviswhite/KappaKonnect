# Fix 404 Errors in Browser

Since the links aren't working in the browser, this is a **deployment configuration issue**, not a PWA issue.

## Step 1: Identify Your Deployment Platform

The error format `iad1::m89tl-...` suggests **Vercel**. 

## Step 2: Verify Configuration Files

Make sure these files are in your **repository root** (not just locally):

1. ✅ `vercel.json` - Should be in root
2. ✅ `netlify.toml` - Should be in root (if using Netlify)
3. ✅ `public/_redirects` - Should be in `public/` folder

## Step 3: Check Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **General**
4. Check **Build & Development Settings**:
   - **Framework Preset**: Should be "Vite" or "Other"
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

## Step 4: Verify vercel.json is Deployed

1. In Vercel Dashboard → **Deployments**
2. Click on the latest deployment
3. Check **Files** tab
4. Look for `vercel.json` in the root
5. If it's missing, **push it to git** and redeploy

## Step 5: Force Redeploy

1. In Vercel Dashboard → **Deployments**
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger redeploy

## Step 6: Test the Root URL

1. Open your deployed URL (e.g., `https://your-app.vercel.app`)
2. Does the homepage load? ✅
3. Try navigating to `/events` - does it 404? ❌

If homepage works but routes don't, the `vercel.json` isn't being read.

## Step 7: Manual Fix in Vercel

If `vercel.json` isn't working:

1. Go to Vercel Dashboard → Your Project → **Settings**
2. Go to **Functions** or **Headers**
3. Add a rewrite rule manually:
   - **Source**: `/(.*)`
   - **Destination**: `/index.html`

## Alternative: Test Locally First

Test if the build works locally:

```bash
npm run build
npm run preview
```

Then visit `http://localhost:4173/events` - does it work?
- ✅ If yes → deployment config issue
- ❌ If no → build/routing issue

## Still Not Working?

Share:
1. What deployment platform are you using? (Vercel, Netlify, etc.)
2. What's your deployed URL?
3. Does the homepage (`/`) work?
4. What exact error do you see when visiting `/events`?
