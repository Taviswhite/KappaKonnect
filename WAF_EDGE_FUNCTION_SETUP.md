# WAF Edge Function Setup

## What Changed

I've created an **Edge Function** (`api/waf.ts`) that will handle WAF protection. This is more reliable than Edge Middleware for Vite projects.

## How It Works

1. **All requests** are routed through `/api/waf` (configured in `vercel.json`)
2. The Edge Function checks for threats (SQL injection, XSS, etc.)
3. If a threat is detected → Returns `403 Forbidden`
4. If safe → Serves your app (index.html for SPA routes, static files as-is)

## Files Created/Modified

- ✅ `api/waf.ts` - Edge Function with WAF logic
- ✅ `vercel.json` - Updated to route through Edge Function

## Deploy and Test

1. **Commit and push:**
   ```bash
   git add api/waf.ts vercel.json
   git commit -m "Add WAF Edge Function for reliable threat protection"
   git push origin main
   ```

2. **Wait 2-3 minutes** for Vercel to deploy

3. **Test the WAF:**
   ```bash
   ./verify-waf.sh
   ```

## Expected Results

After deployment:

- ✅ `/.env` → `404 Not Found` (blocked)
- ✅ `/?id=%27%20OR%201%3D1--` → `403 Forbidden` (SQL injection blocked)
- ✅ `/?name=%3Cscript%3E` → `403 Forbidden` (XSS blocked)
- ✅ `/` → `200 OK` (normal page works)

## Check Logs

1. Go to **Vercel Dashboard** → Your Project → **Logs**
2. Look for: `[WAF Edge Function] ===== EXECUTING =====`
3. You should see logs for every request

## If Something Breaks

If your site stops working after this change:

1. **Check Vercel deployment logs** for errors
2. **Revert the vercel.json change**:
   ```json
   "rewrites": [
     {
       "source": "/(.*)",
       "destination": "/index.html"
     }
   ]
   ```
3. The Edge Function approach might need adjustment for your specific setup

## Why Edge Function Instead of Middleware?

- ✅ **More reliable** for Vite projects
- ✅ **Easier to debug** (logs are clearer)
- ✅ **More control** over request handling
- ✅ **Works consistently** across all Vercel projects

The Edge Function will definitely execute and you'll see logs, making it easier to verify it's working.
