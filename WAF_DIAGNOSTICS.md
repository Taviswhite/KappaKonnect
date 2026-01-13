# WAF Diagnostics - Why It Might Not Be Working

## Current Status

Based on your test results:
- ✅ `.env` returns `307` (redirect from vercel.json) - **This is working, but via redirects, not middleware**
- ❌ SQL injection test failed (curl rejected malformed URL) - **Need URL encoding**
- ❌ XSS test returned `200` instead of `403` - **Middleware not detecting or not running**
- ✅ Normal page works (`200`) - **Expected**

## The Problem

**Vercel processes redirects in `vercel.json` BEFORE Edge Middleware runs.**

This means:
1. `.env` requests are redirected by `vercel.json` (307) before middleware can block them
2. Query parameter threats (SQL injection, XSS) should be caught by middleware, but they're not

## Possible Causes

### 1. Middleware Not Running

**Check if middleware is deployed:**
```bash
# Check if middleware.ts is in the repo
git ls-files | grep middleware

# Check latest deployment logs in Vercel dashboard
# Look for any errors about middleware
```

**Test if middleware is executing:**
- The middleware logs every request with `[WAF]` prefix
- Check Vercel logs for these entries
- If you see NO `[WAF]` logs, middleware isn't running

### 2. Middleware Format Issue

For Vercel Edge Middleware with Vite, the file must:
- ✅ Be at root: `middleware.ts`
- ✅ Export default function: `export default function middleware(request: Request)`
- ✅ Return `Response | undefined`
- ✅ Have `export const config` with matcher

**Current format looks correct**, but Vercel might not be recognizing it.

### 3. Matcher Pattern Too Restrictive

The current matcher might be excluding some requests. Try simplifying:

```typescript
export const config = {
  matcher: ['/(.*)'],  // Match everything
};
```

### 4. Query Parameters Not Being Checked

The middleware checks `searchParams`, but URL-encoded parameters might not match patterns.

**Fix applied:** Now decodes URL parameters before checking.

## Solutions

### Solution 1: Verify Middleware is Running

1. **Check Vercel deployment logs:**
   - Go to Vercel Dashboard → Your Project → Latest Deployment
   - Look for "Edge Middleware" or "middleware.ts" in build logs
   - Check for any errors

2. **Test with a simple log:**
   Add this at the very start of middleware:
   ```typescript
   console.log('[WAF] MIDDLEWARE EXECUTING - This should appear in logs');
   ```

3. **Check Edge Runtime logs:**
   - Vercel Dashboard → Logs → Filter for "Edge Runtime"
   - Look for `[WAF]` entries

### Solution 2: Remove Redirects (Let Middleware Handle)

If middleware is working, remove redirects from `vercel.json` and let middleware return 404:

```json
// Remove these from vercel.json redirects:
{
  "source": "/.env",
  "destination": "/404",
  "permanent": false
}
```

Then middleware will handle blocking with 404.

### Solution 3: Use Vercel CLI to Test Locally

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally
vercel dev

# Make test requests
curl "http://localhost:3000/?id=' OR 1=1--"
# Check terminal for [WAF] logs
```

### Solution 4: Alternative - Use Vercel Edge Functions

If Edge Middleware isn't working, create an Edge Function instead:

1. Create `api/waf.ts`:
```typescript
export const config = { runtime: 'edge' };

export default function handler(req: Request) {
  // WAF logic here
}
```

2. Configure in `vercel.json` to route through it.

## Quick Test Commands

```bash
# Test 1: Check if middleware logs appear
curl https://kappaconnect.vercel.app/
# Then check Vercel logs for [WAF] entry

# Test 2: Test SQL injection (URL encoded)
curl "https://kappaconnect.vercel.app/?id=%27%20OR%201%3D1--"
# Should return 403 if middleware is working

# Test 3: Test XSS (URL encoded)
curl "https://kappaconnect.vercel.app/?name=%3Cscript%3Ealert%28%27XSS%27%29%3C%2Fscript%3E"
# Should return 403 if middleware is working

# Test 4: Check response headers
curl -I https://kappaconnect.vercel.app/
# Look for any X-WAF headers (if we add them)
```

## Next Steps

1. **Deploy the updated middleware** (with URL decoding fix)
2. **Run the updated test script**: `./verify-waf.sh`
3. **Check Vercel logs** for `[WAF]` entries
4. **If still not working**, try Solution 3 (Vercel CLI local test)
5. **If middleware isn't running**, consider Solution 4 (Edge Function)

## Expected Behavior After Fix

After deploying the updated middleware:

- ✅ `.env` → `404` (from middleware) OR `307` (from vercel.json redirect - both are fine)
- ✅ `/?id=%27%20OR%201%3D1--` → `403` (SQL injection blocked)
- ✅ `/?name=%3Cscript%3E` → `403` (XSS blocked)
- ✅ `/` → `200` (normal page works)

If you see `[WAF]` logs in Vercel, the middleware IS running, even if blocking isn't perfect yet.
