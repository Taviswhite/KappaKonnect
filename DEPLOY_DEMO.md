# Deploy Separate Demo on Vercel

This guide shows how to deploy a separate demo instance of KappaKonnect on Vercel.

## Why Separate Demo?

- Isolated from production
- Pre-populated with mock data
- Safe for public access
- Different Supabase instance
- No risk to real data

---

## Option 1: Deploy from Main Branch (Recommended)

### Step 1: Create Demo Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name it: `kappakonnect-demo`
4. Choose a region and password
5. Wait for project to be ready (~2 minutes)

### Step 2: Set Up Demo Database

1. In Supabase dashboard, go to SQL Editor
2. Run the complete setup migration:
   ```bash
   # Copy content from: supabase/migrations/000_complete_setup.sql
   ```
3. Run the demo seed data:
   ```bash
   # Copy content from: supabase/migrations/seed_demo_data.sql
   ```
4. Verify tables are created:
   - Go to Table Editor
   - You should see: profiles, events, tasks, documents, etc.

### Step 3: Deploy to Vercel

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click "Add New" → "Project"

2. **Import Repository:**
   - Click "Import Git Repository"
   - Select your `KappaKonnect` repository
   - Click "Import"

3. **Configure Project:**
   - **Project Name:** `kappakonnect-demo`
   - **Framework Preset:** Vite (should auto-detect)
   - **Root Directory:** `./` (leave default)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Add Environment Variables:**
   
   Click "Environment Variables" and add:
   
   ```
   VITE_SUPABASE_URL=https://YOUR-DEMO-PROJECT.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_demo_anon_key
   VITE_PUBLIC_BASE_URL=https://kappakonnect-demo.vercel.app
   ```
   
   To find these values:
   - Go to your demo Supabase project
   - Settings → API
   - Copy "Project URL" and "anon public" key

5. **Deploy:**
   - Click "Deploy"
   - Wait for deployment (~2-3 minutes)
   - Your demo will be at: `https://kappakonnect-demo.vercel.app`

### Step 4: Test Demo Deployment

1. Visit your demo URL
2. Login with demo credentials (from seed_demo_data.sql):
   - Email: `admin@kappakonnect.com`
   - Password: (check seed script or create one)

---

## Option 2: Deploy from Demo Branch

This method uses a separate git branch for demo-specific configurations.

### Step 1: Create Demo Branch

```bash
# Create and switch to demo branch
git checkout -b demo

# Make demo-specific changes if needed
# (e.g., different branding, features, etc.)

# Commit changes
git add .
git commit -m "Demo branch configuration"

# Push to GitHub
git push origin demo
```

### Step 2: Deploy Demo Branch to Vercel

1. Go to Vercel Dashboard
2. Click "Add New" → "Project"
3. Import your repository
4. **In the setup:**
   - Project Name: `kappakonnect-demo`
   - Git Branch: Select `demo` branch
   - Add environment variables (see Option 1, Step 4)
5. Click "Deploy"

### Step 3: Configure Auto-Deployments

In Vercel project settings:
- Go to: Settings → Git
- Set production branch to: `demo`
- Now pushes to `demo` branch auto-deploy

---

## Option 3: Use Existing Project with Different Environment

Deploy the same codebase with different environment variables.

### Quick Steps:

1. **Deploy Second Instance:**
   - Import same repository again
   - Name it differently: `kappakonnect-demo`

2. **Use Demo Supabase:**
   - Set demo environment variables
   - Different Supabase project for demo

3. **Done!**
   - Same code, different data
   - Isolated deployments

---

## Environment Variables Comparison

### Production (.env)
```bash
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_prod_anon_key
VITE_PUBLIC_BASE_URL=https://kappakonnect.vercel.app
```

### Demo (Vercel Environment Variables)
```bash
VITE_SUPABASE_URL=https://your-demo-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_demo_anon_key
VITE_PUBLIC_BASE_URL=https://kappakonnect-demo.vercel.app
```

---

## Demo Data Setup Script

Create a quick script to seed demo data:

```bash
# In Supabase SQL Editor for demo project

-- Run 000_complete_setup.sql first
-- Then run seed_demo_data.sql

-- Verify data loaded:
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM events;
SELECT COUNT(*) FROM tasks;
SELECT COUNT(*) FROM documents;
```

---

## Vercel Deployment Checklist

- [ ] Demo Supabase project created
- [ ] Database schema migrated (000_complete_setup.sql)
- [ ] Demo data seeded (seed_demo_data.sql)
- [ ] Vercel project created (`kappakonnect-demo`)
- [ ] Environment variables configured
- [ ] Deployment successful
- [ ] Demo site accessible
- [ ] Demo login works
- [ ] All pages load correctly
- [ ] QR code generated for demo URL

---

## Maintenance

### Updating Demo Data

1. Update seed_demo_data.sql
2. In Supabase SQL Editor:
   ```sql
   -- Clear old data
   TRUNCATE profiles, events, tasks, documents CASCADE;
   
   -- Re-run seed script
   -- Paste content from seed_demo_data.sql
   ```

### Updating Demo Code

**If using same branch (Option 1):**
```bash
git push origin main
# Vercel auto-deploys both prod and demo
```

**If using demo branch (Option 2):**
```bash
# Switch to demo branch
git checkout demo

# Merge changes from main
git merge main

# Push to deploy
git push origin demo
```

---

## Troubleshooting

### Environment Variables Not Working

1. Check Vercel Dashboard → Settings → Environment Variables
2. Ensure variables start with `VITE_`
3. Redeploy after adding variables:
   - Go to Deployments
   - Click "..." on latest deployment
   - Click "Redeploy"

### Demo Data Not Showing

1. Check Supabase connection:
   - Open browser console
   - Look for Supabase errors
2. Verify RLS policies:
   - Some policies may need adjustment for demo
3. Check seed script ran successfully:
   ```sql
   SELECT COUNT(*) FROM profiles;
   -- Should return > 0
   ```

### 404 Errors on Demo

1. Check vercel.json is deployed
2. Verify rewrite rules:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
3. Check build completed successfully in Vercel logs

---

## Quick Deploy Commands

```bash
# Create demo Supabase project (via dashboard)
# Then run in Supabase SQL Editor:
# 1. Run 000_complete_setup.sql
# 2. Run seed_demo_data.sql

# Deploy to Vercel (via dashboard or CLI)
npx vercel --prod
# Follow prompts, set environment variables

# Or use Vercel CLI for faster deploys:
npm i -g vercel
vercel login
vercel --prod
```

---

## Demo Access

Once deployed, share your demo:

1. **Demo URL:** `https://kappakonnect-demo.vercel.app`
2. **QR Code:** Generate at https://qr.io
3. **Demo Credentials:**
   - Email: `admin@kappakonnect.com`
   - Password: (from your seed script)
4. **Share:** Print QR code or send link

---

## Best Practices

1. **Separate Supabase Projects**
   - Never use production DB for demo
   - Keeps data isolated and safe

2. **Regular Demo Data Refresh**
   - Update seed script monthly
   - Keep demo data fresh and relevant

3. **Monitor Demo Usage**
   - Check Vercel analytics
   - Monitor Supabase usage

4. **Lock Down Demo**
   - Disable signups in demo
   - Read-only for sensitive data
   - Reset weekly if needed

5. **Branding**
   - Add "DEMO" banner to demo site
   - Make it clear it's a demo environment
