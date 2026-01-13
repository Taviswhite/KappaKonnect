# Web Application Firewall (WAF) Protection

## Overview

Your KappaConnect application is now protected by a Web Application Firewall (WAF) that runs on Vercel's Edge Network. This provides real-time protection against common web attacks before requests reach your application.

## Protection Features

### 🛡️ Threat Detection

The WAF automatically detects and blocks:

1. **SQL Injection Attacks**
   - Detects SQL injection patterns in URLs and query parameters
   - Blocks attempts like `' OR 1=1--`, `UNION SELECT`, etc.

2. **Cross-Site Scripting (XSS)**
   - Detects script injection attempts
   - Blocks `<script>` tags, `javascript:`, event handlers, etc.

3. **Path Traversal**
   - Prevents directory traversal attacks
   - Blocks `../`, `..\\`, and encoded variations

4. **Command Injection**
   - Detects shell command injection attempts
   - Blocks common command patterns

5. **Sensitive File Access**
   - Automatically blocks access to:
     - `.env` files
     - `.git/` directory
     - `config.json`, `package.json`
     - Database files (`.sql`)
     - Log files (`.log`)

### ⚡ Rate Limiting

- **100 requests per minute** per IP address
- Automatic blocking for 15 minutes if limit exceeded
- Prevents DDoS and brute force attacks

### 📊 Logging

All blocked requests are logged with:
- Client IP address
- Request path and method
- Threat type detected
- Timestamp

## How It Works

The WAF runs as **Vercel Edge Middleware** (`middleware.ts`), which means:

- ✅ Runs on Vercel's global edge network (fast!)
- ✅ Executes before requests reach your application
- ✅ Zero impact on legitimate users
- ✅ No additional latency

## Configuration

### Rate Limits

You can adjust rate limits in `middleware.ts`:

```typescript
const RATE_LIMIT = {
  windowMs: 60 * 1000,      // Time window (1 minute)
  maxRequests: 100,         // Max requests per window
};
```

### Threat Patterns

Threat detection patterns are defined in `THREAT_PATTERNS` object. You can:
- Add new patterns
- Modify existing patterns
- Adjust sensitivity

### Bot Detection (Optional)

Bot detection is currently disabled. To enable it, uncomment the bot detection section in `middleware.ts`:

```typescript
// Uncomment to block bots:
if (isBot(userAgent)) {
  return new Response('Forbidden', { status: 403 });
}
```

## Monitoring

### View Logs

WAF logs are available in:
1. **Vercel Dashboard** → Your Project → Logs
2. Look for entries prefixed with `[WAF]`

### Common Log Messages

- `[WAF] Rate limit exceeded: <IP>` - IP exceeded rate limit
- `[WAF] Sensitive file access blocked: <path>` - Attempted access to protected file
- `[WAF] Path traversal attempt blocked: <path>` - Directory traversal detected
- `[WAF] Malicious query detected: <query>` - SQL injection or XSS detected

## Testing the WAF

### Test Rate Limiting

Make 100+ rapid requests to your site. The 101st request should return:
```json
{
  "error": "Rate limit exceeded",
  "message": "Rate limit exceeded. Too many requests from this IP."
}
```

### Test Threat Detection

Try accessing:
- `https://your-site.vercel.app/.env` → Should return 404
- `https://your-site.vercel.app/.git/config` → Should return 404
- `https://your-site.vercel.app/?q=' OR 1=1--` → Should return 403

## Deployment

The WAF is automatically active when you deploy to Vercel. No additional configuration needed!

1. **Commit the middleware**:
   ```bash
   git add middleware.ts
   git commit -m "Add WAF protection"
   git push
   ```

2. **Vercel automatically deploys** the middleware

3. **Verify it's working**:
   - Check Vercel logs for `[WAF]` entries
   - Test with a malicious request

## Performance Impact

- **Zero latency** for legitimate requests
- **Minimal overhead** - Edge functions are extremely fast
- **Global distribution** - Runs on Vercel's edge network worldwide

## Security Best Practices

The WAF is one layer of security. Also ensure:

1. ✅ **Security headers** (already configured in `vercel.json`)
2. ✅ **Environment variables** secured in Vercel dashboard
3. ✅ **Supabase RLS policies** properly configured
4. ✅ **Regular dependency updates** (`npm audit`)
5. ✅ **HTTPS only** (enforced by Vercel)

## Troubleshooting

### WAF blocking legitimate requests

If the WAF is too aggressive:

1. Check Vercel logs to see what was blocked
2. Adjust threat patterns in `middleware.ts`
3. Add exceptions for specific paths if needed

### Rate limiting too strict

If users are hitting rate limits:

1. Increase `maxRequests` in `RATE_LIMIT` config
2. Adjust `windowMs` for longer time windows
3. Consider IP whitelisting for trusted sources

## Additional Resources

- [Vercel Edge Middleware Docs](https://vercel.com/docs/functions/edge-middleware)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Vercel Security Best Practices](https://vercel.com/docs/security)

---

**Note**: The WAF provides protection at the edge, but always implement proper security in your application code as well!
