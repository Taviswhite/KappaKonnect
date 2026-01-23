# Trigger Vercel Deployment

## If No Deployments Are Showing

### Option 1: Manual Deployment via Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your **KappaKonnect** project

2. **Check Project Settings**
   - Go to **Settings** → **Git**
   - Verify:
     - ✅ Repository is connected: `Taviswhite/KappaKonnect`
     - ✅ Production Branch: `main`
     - ✅ Root Directory: `./` (or leave default)

3. **Manually Trigger Deployment**
   - Go to **Deployments** tab
   - Click **"Create Deployment"** button (if available)
   - Or click **"..."** menu → **"Redeploy"**

### Option 2: Use Vercel CLI

If dashboard doesn't work, use CLI:

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project (if not already linked)
vercel link

# Deploy to production
vercel --prod
```

### Option 3: Push a Commit (Already Done)

I just pushed a commit to trigger deployment. Check Vercel dashboard in a few seconds.

---

## Verify Deployment Settings

Make sure your Vercel project is configured correctly:

1. **Vercel Dashboard** → **Your Project** → **Settings** → **General**
2. Check:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install` (or default)

---

## Check Build Logs

If deployment appears but fails:

1. Go to **Deployments** tab
2. Click on the deployment
3. Click **"View Build Logs"**
4. Look for errors:
   - Missing environment variables
   - Build failures
   - Dependency issues

---

## Common Issues

### Issue: "No deployments showing"
**Solution:** 
- Make sure repository is properly connected
- Check that you're looking at the correct project
- Try refreshing the page
- Check if there are any errors in the project settings

### Issue: "Deployment failed"
**Solution:**
- Check build logs for specific errors
- Verify environment variables are set
- Ensure `vercel.json` is committed
- Check that `package.json` has correct build script

### Issue: "Repository not connected"
**Solution:**
- Go to **Settings** → **Git**
- Click **"Connect Git Repository"**
- Select `Taviswhite/KappaKonnect`
- Follow the prompts

---

## Next Steps

After deployment appears:

1. ✅ Add environment variables (if not already done)
2. ✅ Wait for build to complete
3. ✅ Check deployment status
4. ✅ Visit your Vercel URL
5. ✅ Test the app

---

## Environment Variables Needed

Don't forget to add these in **Settings** → **Environment Variables**:

```
VITE_SUPABASE_URL=https://bqhnlsowskqqhcgkxakq.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_70kD9_y_v92BH2afaIVZag_k_l7OK0p
```

Set for **ALL environments** (Production, Preview, Development).
