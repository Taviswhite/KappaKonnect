# How to View WAF Logs in Vercel

## Important: Edge Middleware Logs Location

Vercel Edge Middleware logs appear in **Edge Runtime logs**, which are separate from standard function logs. Here's where to find them:

---

## Method 1: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**:
   - Visit: https://vercel.com/dashboard
   - Select your project: `remix-of-crimson-connect`

2. **Navigate to Logs**:
   - Click on your project
   - Click the **"Logs"** tab at the top
   - **Important**: Look for logs labeled as **"Edge Runtime"** or **"Middleware"**

3. **Filter Logs**:
   - In the search/filter box, type: `[WAF]`
   - This will show only WAF-related logs
   - You can also filter by: `WAF`, `BLOCKED`, `ALLOWED`

4. **What You'll See**:
   ```
   [WAF] GET / from 192.168.1.100
   [WAF] ALLOWED - GET / from 192.168.1.100
   [WAF] BLOCKED - Malicious query: ?id=' OR 1=1-- from 192.168.1.100
   ```

---

## Method 2: Vercel CLI (Real-Time)

If you have Vercel CLI installed:

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# View logs in real-time
vercel logs --follow

# Filter for WAF logs
vercel logs --follow | grep "WAF"
```

---

## Method 3: Check Deployment Logs

1. **Go to Deployments**:
   - Vercel Dashboard → Your Project → **"Deployments"** tab

2. **Click on Latest Deployment**:
   - Click the three dots (⋯) next to the latest deployment
   - Select **"View Build Logs"** or **"View Function Logs"**

3. **Look for Edge Middleware**:
   - Scroll through the logs
   - Look for entries mentioning "Edge Middleware" or "middleware.ts"

---

## Why Logs Might Not Show Up

### 1. Middleware Not Running
**Check if middleware is deployed:**
- Verify `middleware.ts` is in your repository root
- Check that it was included in the last deployment
- Look for build errors in deployment logs

**Test if middleware is running:**
```bash
# Make a request to your site
curl -v https://kappaconnect.vercel.app/

# Check logs immediately after
# You should see: [WAF] GET / from <IP>
```

### 2. Logs in Different Location
**Edge Middleware logs are separate:**
- They don't appear in standard "Function Logs"
- Look specifically for "Edge Runtime" logs
- Check "Real-time Logs" in Vercel dashboard

### 3. Logs Not Persisted
**Edge Middleware logs might be:**
- Only visible in real-time
- Not stored for long periods
- Only shown for recent requests

**Solution**: Use Vercel CLI with `--follow` to watch logs in real-time

### 4. Matcher Too Restrictive
**If the matcher is blocking the middleware:**
- Check `middleware.ts` line 223
- The matcher might be excluding your test paths
- Try accessing a page route (not static files)

---

## Testing to Confirm Logs Are Working

### Step 1: Make a Normal Request
```bash
curl https://kappaconnect.vercel.app/
```

**Expected log:**
```
[WAF] GET / from <your-ip>
[WAF] ALLOWED - GET / from <your-ip>
```

### Step 2: Make a Malicious Request
```bash
curl "https://kappaconnect.vercel.app/?id=' OR 1=1--"
```

**Expected log:**
```
[WAF] GET /?id=' OR 1=1-- from <your-ip>
[WAF] BLOCKED - Malicious query: ?id=' OR 1=1-- from <your-ip>
```

### Step 3: Try Accessing Sensitive File
```bash
curl https://kappaconnect.vercel.app/.env
```

**Expected log:**
```
[WAF] GET /.env from <your-ip>
[WAF] BLOCKED - Sensitive file access: /.env from <your-ip>
```

---

## Real-Time Monitoring Script

Save this as `watch-waf-logs.sh`:

```bash
#!/bin/bash

echo "🔍 Watching WAF logs in real-time..."
echo "Press Ctrl+C to stop"
echo ""

# If you have Vercel CLI
if command -v vercel &> /dev/null; then
  vercel logs --follow | grep --line-buffered "WAF"
else
  echo "⚠️  Vercel CLI not installed"
  echo "Install it with: npm i -g vercel"
  echo ""
  echo "Or check logs manually in Vercel Dashboard:"
  echo "https://vercel.com/dashboard"
fi
```

Make it executable:
```bash
chmod +x watch-waf-logs.sh
./watch-waf-logs.sh
```

---

## Troubleshooting

### No Logs Appearing at All

1. **Check if middleware file exists**:
   ```bash
   ls -la middleware.ts
   ```

2. **Check if it's in git**:
   ```bash
   git ls-files | grep middleware
   ```

3. **Verify deployment included it**:
   - Check Vercel deployment logs
   - Look for "middleware.ts" in build output

4. **Test locally** (if using Vercel CLI):
   ```bash
   vercel dev
   # Make a request
   # Check terminal output for logs
   ```

### Logs Show But No [WAF] Prefix

If you see logs but without `[WAF]` prefix:
- The middleware might not be the one running
- Check if there are multiple middleware files
- Verify the export format in `middleware.ts`

### Logs Only Show Errors

If you only see `BLOCKED` logs but not `ALLOWED`:
- This is normal - the middleware logs every request
- Check if `console.log` is working (might be filtered)
- Try accessing your site normally and check logs

---

## Alternative: Add Response Headers for Testing

If logs aren't showing, we can add a response header to confirm the middleware is running:

```typescript
// In middleware.ts, add this header to all responses:
headers: {
  'X-WAF-Status': 'active',
  'X-WAF-IP': clientIP,
}
```

Then check response headers:
```bash
curl -I https://kappaconnect.vercel.app/
# Look for X-WAF-Status header
```

---

## Quick Checklist

- [ ] `middleware.ts` is in repository root
- [ ] File is committed and pushed to GitHub
- [ ] Latest deployment completed successfully
- [ ] Checked "Edge Runtime" logs (not just "Function Logs")
- [ ] Made a test request to trigger logging
- [ ] Used `[WAF]` filter in Vercel dashboard
- [ ] Tried Vercel CLI: `vercel logs --follow | grep WAF`

---

## Still Not Working?

If logs still don't appear:

1. **Verify middleware is actually running**:
   - Try accessing `/.env` - should return 404 (blocked by middleware)
   - Try `/?id=' OR 1=1--` - should return 403 (blocked by middleware)

2. **Check Vercel project settings**:
   - Ensure Edge Middleware is enabled
   - Check for any deployment errors

3. **Contact Vercel Support**:
   - They can help verify Edge Middleware is configured correctly
   - They can check if logs are being generated but not displayed

---

## Next Steps

Once you can see logs:

1. ✅ Monitor for blocked requests
2. ✅ Check for false positives
3. ✅ Adjust threat patterns if needed
4. ✅ Review rate limiting effectiveness
5. ✅ Document any custom exceptions

Your WAF is protecting your site even if logs aren't visible - the blocking still works! 🛡️
