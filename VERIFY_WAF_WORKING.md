# Quick Test: Verify WAF is Working

Since Edge Middleware logs can be hard to find, here's how to verify your WAF is actually running and protecting your site:

---

## Test 1: Verify Sensitive File Blocking ✅

**This is the easiest test - it should work immediately:**

```bash
# Test .env access
curl -I https://kappaconnect.vercel.app/.env

# Expected: HTTP/1.1 404 Not Found
# If you see 404, WAF is working! ✅
```

**In Browser:**
```
https://kappaconnect.vercel.app/.env
```
Should show: `404 Not Found` (not your actual .env file)

---

## Test 2: Verify SQL Injection Blocking ✅

```bash
# Test SQL injection
curl -v "https://kappaconnect.vercel.app/?id=' OR 1=1--"

# Expected: HTTP/1.1 403 Forbidden
# Response body: {"error":"Forbidden","message":"Malicious request detected and blocked."}
```

**In Browser:**
```
https://kappaconnect.vercel.app/?id=' OR 1=1--
```
Should show: `403 Forbidden` with JSON error message

---

## Test 3: Verify XSS Blocking ✅

```bash
# Test XSS
curl -v "https://kappaconnect.vercel.app/?name=<script>alert('XSS')</script>"

# Expected: HTTP/1.1 403 Forbidden
```

**In Browser:**
```
https://kappaconnect.vercel.app/?name=<script>alert('XSS')</script>
```
Should show: `403 Forbidden`

---

## Test 4: Verify Normal Requests Work ✅

```bash
# Test normal page
curl -I https://kappaconnect.vercel.app/

# Expected: HTTP/1.1 200 OK
# Your site should load normally
```

**In Browser:**
```
https://kappaconnect.vercel.app/
```
Should load your app normally ✅

---

## Quick Test Script

Run this to test everything at once:

```bash
#!/bin/bash

SITE="https://kappaconnect.vercel.app"

echo "🧪 Testing WAF Protection..."
echo ""

echo "1. Testing .env access (should be 404)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE/.env")
if [ "$STATUS" = "404" ]; then
  echo "   ✅ PASS - .env blocked (404)"
else
  echo "   ❌ FAIL - Got $STATUS (expected 404)"
fi

echo ""
echo "2. Testing SQL injection (should be 403)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE/?id=' OR 1=1--")
if [ "$STATUS" = "403" ]; then
  echo "   ✅ PASS - SQL injection blocked (403)"
else
  echo "   ❌ FAIL - Got $STATUS (expected 403)"
fi

echo ""
echo "3. Testing XSS (should be 403)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE/?name=<script>alert('XSS')</script>")
if [ "$STATUS" = "403" ]; then
  echo "   ✅ PASS - XSS blocked (403)"
else
  echo "   ❌ FAIL - Got $STATUS (expected 403)"
fi

echo ""
echo "4. Testing normal page (should be 200)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE/")
if [ "$STATUS" = "200" ]; then
  echo "   ✅ PASS - Normal page works (200)"
else
  echo "   ❌ FAIL - Got $STATUS (expected 200)"
fi

echo ""
echo "✅ WAF Test Complete!"
```

Save as `verify-waf.sh`, make executable, and run:
```bash
chmod +x verify-waf.sh
./verify-waf.sh
```

---

## What Each Test Proves

| Test | What It Proves | Expected Result |
|------|---------------|-----------------|
| `.env` access | WAF is blocking sensitive files | `404 Not Found` |
| SQL injection | WAF is detecting SQL injection | `403 Forbidden` |
| XSS | WAF is detecting XSS attacks | `403 Forbidden` |
| Normal page | WAF isn't blocking legitimate traffic | `200 OK` |

---

## If Tests Fail

### If `.env` returns 200 or shows file contents:
- ❌ WAF is NOT running
- Check: Is `middleware.ts` in the repository?
- Check: Was it deployed in the latest deployment?
- Check: Are there any build errors?

### If SQL injection returns 200:
- ❌ WAF is NOT detecting threats
- Check: Is the middleware actually running?
- Check: Are there errors in deployment logs?

### If normal page returns 403:
- ⚠️ WAF might be too aggressive
- Check: Are there false positives?
- Adjust: Threat patterns might need tuning

---

## Finding Logs (If You Still Want Them)

Even if you can't see logs, the WAF is working if the tests above pass. But if you want to find logs:

1. **Vercel Dashboard** → Your Project → **Logs** tab
2. Look for **"Edge Runtime"** logs (not "Function Logs")
3. Filter by: `WAF` or `BLOCKED`
4. Use **Vercel CLI**: `vercel logs --follow | grep WAF`

See `HOW_TO_VIEW_WAF_LOGS.md` for detailed instructions.

---

## Bottom Line

**If the blocking tests work (404 for .env, 403 for SQL injection/XSS), your WAF is working!** 🎉

The logs are just for monitoring - the actual protection is what matters. If blocking works, the WAF is active and protecting your site.
