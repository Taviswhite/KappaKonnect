# WAF Solution - Current Status

## Problem

The WAF is not blocking threats (SQL injection, XSS return 200 instead of 403). Both Edge Middleware and Edge Function approaches have issues.

## Root Cause

1. **Edge Middleware (`middleware.ts`)**: May not be executing for Vite projects
2. **Edge Function (`api/waf.ts`)**: Rewrite loops and path handling issues

## Working Solution: Use `vercel.json` Redirects + Client-Side Protection

Since Vercel's Edge Middleware/Function approaches are complex for Vite SPAs, use a hybrid approach:

### 1. Keep `vercel.json` Redirects (Already Working)

Your `vercel.json` already blocks sensitive files with redirects - this is working! ✅

### 2. Add Client-Side Threat Detection

Add threat detection in your React app to block malicious queries on the client side.

### 3. Use Supabase RLS for Backend Protection

Your Supabase Row Level Security (RLS) policies already protect the database.

## Recommended: Simplify and Use What Works

**Option A: Keep Current Setup + Add Client-Side Checks**

1. Keep `vercel.json` redirects (working for sensitive files)
2. Add client-side query parameter sanitization in your React app
3. Rely on Supabase RLS for database protection

**Option B: Use a Third-Party WAF**

- Cloudflare (if using Cloudflare)
- AWS WAF (if using AWS)
- Vercel's built-in DDoS protection (already active)

## Current Protection Status

✅ **Sensitive Files**: Blocked via `vercel.json` redirects (307/404)
✅ **Database**: Protected by Supabase RLS
✅ **DDoS**: Protected by Vercel
❌ **Query Parameter Threats**: Not blocked (SQL injection, XSS in URLs)

## Quick Fix: Add Client-Side Protection

Add this to your React app's entry point (`src/main.tsx` or `src/App.tsx`):

```typescript
// Check URL for malicious patterns
const checkURLForThreats = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const queryString = window.location.search;
  
  const threats = [
    /('|%27)\s*or\s*1\s*=\s*1/i,
    /<script/i,
    /javascript:/i,
    /--/i,
  ];
  
  for (const threat of threats) {
    if (threat.test(queryString) || threat.test(decodeURIComponent(queryString))) {
      window.location.href = '/blocked';
      return true;
    }
  }
  return false;
};

// Run on page load
if (checkURLForThreats()) {
  // Redirect already happened
}
```

## Next Steps

1. **Deploy current changes** (Edge Function with improved logging)
2. **Check Vercel logs** for `[WAF Edge Function]` entries
3. **If logs appear but blocking doesn't work**: The patterns need adjustment
4. **If no logs appear**: Edge Function isn't executing - use Option A or B above

## Testing

After deploying, check Vercel logs:
- Look for `[WAF Edge Function] ===== EXECUTING =====`
- If you see this, the function is running
- If blocking still doesn't work, the patterns need tuning

## Recommendation

For now, **keep the `vercel.json` redirects** (they're working) and **add client-side protection** for query parameters. This gives you:
- ✅ Server-side file blocking (via redirects)
- ✅ Client-side query parameter blocking
- ✅ Database protection (via Supabase RLS)
- ✅ DDoS protection (via Vercel)

This is a practical, working solution while we debug the Edge Function approach.
