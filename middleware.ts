/**
 * Web Application Firewall (WAF) Edge Middleware
 * Protects the application from common attacks and suspicious requests
 * 
 * This runs on Vercel's Edge Network before requests reach your application
 * Works with Vite, Next.js, and other frameworks
 */

// Vercel Edge Middleware uses Web API Request/Response
type EdgeRequest = Request;
type EdgeResponse = Response;

// Threat patterns
const THREAT_PATTERNS = {
  sqlInjection: [
    /('|%27)\s*or\s*1\s*=\s*1/i,
    /(--|#|\/\*)/i,
    /\bunion\b.*\bselect\b/i,
    /\bselect\b.*\bfrom\b/i,
    /\binsert\b.*\binto\b/i,
    /\bdelete\b.*\bfrom\b/i,
    /\bdrop\b.*\btable\b/i,
    /\bexec\b.*\(/i,
  ],
  xss: [
    /<script.*?>.*?<\/script>/i,
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /alert\s*\(/i,
    /eval\s*\(/i,
    /document\.cookie/i,
    /document\.write/i,
  ],
  pathTraversal: [
    /\.\.\//g,
    /\.\.\\/g,
    /\.\.%2f/i,
    /\.\.%5c/i,
  ],
  commandInjection: [
    /[;&|`]/,
    /\b(cat|ls|pwd|whoami|nc|netcat|curl|wget)\b/i,
    /\$\{/,
    /\$\(/,
  ],
  sensitiveFiles: [
    /\.env$/i,
    /\.env\./i,
    /\.git\//i,
    /config\.json$/i,
    /package\.json$/i,
    /package-lock\.json$/i,
    /yarn\.lock$/i,
    /\.sql$/i,
    /\.log$/i,
  ],
};

// Rate limiting storage (in-memory, resets on edge function restart)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 1000, // Max 1000 requests per minute per IP
};

/**
 * Check if a string matches any threat pattern
 */
function detectThreat(value: string, patterns: RegExp[]): boolean {
  try {
    const decoded = decodeURIComponent(value);
    return patterns.some((pattern) => pattern.test(decoded) || pattern.test(value));
  } catch {
    // If decoding fails, check original value
    return patterns.some((pattern) => pattern.test(value));
  }
}

/**
 * Check rate limiting
 */
function checkRateLimit(ip: string): { allowed: boolean; message: string } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return { allowed: true, message: 'OK' };
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    return {
      allowed: false,
      message: `Rate limit exceeded. Too many requests from this IP.`,
    };
  }

  // Increment count
  record.count++;
  rateLimitStore.set(ip, record);

  return { allowed: true, message: 'OK' };
}

/**
 * Get client IP address
 */
function getClientIP(request: EdgeRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return 'unknown';
}

/**
 * Main WAF middleware function
 */
export default function middleware(request: EdgeRequest): EdgeResponse | undefined {
  const url = new URL(request.url);
  const path = url.pathname;
  const searchParams = url.searchParams.toString();
  const method = request.method;
  const userAgent = request.headers.get('user-agent') || '';
  const clientIP = getClientIP(request);

  // Log every request to confirm middleware is running
  console.log(`[WAF] ${method} ${path} from ${clientIP}${searchParams ? `?${searchParams.substring(0, 100)}` : ''}`);

  // 1. Check rate limiting FIRST
  const rateLimitCheck = checkRateLimit(clientIP);
  if (!rateLimitCheck.allowed) {
    console.error(`[WAF] BLOCKED - Rate limit exceeded: ${clientIP} - ${path}`);
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: rateLimitCheck.message,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
        },
      }
    );
  }

  // 2. Block sensitive files
  if (detectThreat(path, THREAT_PATTERNS.sensitiveFiles)) {
    console.error(`[WAF] BLOCKED - Sensitive file access: ${path} from ${clientIP}`);
    return new Response('Not Found', { status: 404 });
  }

  // 3. Check path for threats
  if (detectThreat(path, THREAT_PATTERNS.pathTraversal)) {
    console.error(`[WAF] BLOCKED - Path traversal attempt: ${path} from ${clientIP}`);
    return new Response(
      JSON.stringify({
        error: 'Forbidden',
        message: 'Path traversal attempt detected and blocked.',
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // 4. Check query parameters for threats
  if (searchParams) {
    // Decode URL-encoded parameters for better detection
    const decodedParams = decodeURIComponent(searchParams);
    
    if (
      detectThreat(searchParams, THREAT_PATTERNS.sqlInjection) ||
      detectThreat(decodedParams, THREAT_PATTERNS.sqlInjection) ||
      detectThreat(searchParams, THREAT_PATTERNS.xss) ||
      detectThreat(decodedParams, THREAT_PATTERNS.xss) ||
      detectThreat(searchParams, THREAT_PATTERNS.commandInjection) ||
      detectThreat(decodedParams, THREAT_PATTERNS.commandInjection)
    ) {
      console.error(`[WAF] BLOCKED - Malicious query: ${searchParams.substring(0, 200)} from ${clientIP}`);
      return new Response(
        JSON.stringify({
          error: 'Forbidden',
          message: 'Malicious request detected and blocked.',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // Request passed all checks - continue (return undefined to allow request through)
  // Note: We can't modify headers in Edge Middleware for Vite projects the same way
  // Security headers are already set in vercel.json
  console.log(`[WAF] ALLOWED - ${method} ${path} from ${clientIP}`);
  return undefined;
}

/**
 * Configure which routes the middleware runs on
 * For Vercel Edge Middleware, we use the standard matcher pattern
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - Static files (images, fonts, etc.)
     * - API routes (if you have any)
     * - Favicon
     */
    '/((?!.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot|json|xml|txt)).*)',
    // Also match query parameters for threat detection
    '/(.*)',
  ],
};
