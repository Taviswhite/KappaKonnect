/**
 * WAF Edge Function
 * This runs as a Vercel Edge Function and protects all routes
 * More reliable than Edge Middleware for Vite projects
 */

export const config = {
  runtime: 'edge',
};

// Threat patterns (same as middleware.ts)
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

function detectThreat(value: string, patterns: RegExp[]): boolean {
  try {
    const decoded = decodeURIComponent(value);
    return patterns.some((pattern) => pattern.test(decoded) || pattern.test(value));
  } catch {
    return patterns.some((pattern) => pattern.test(value));
  }
}

function getClientIP(request: Request): string {
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

export default async function handler(request: Request): Promise<Response> {
  console.log('[WAF Edge Function] ===== EXECUTING =====');
  
  const url = new URL(request.url);
  const path = url.pathname;
  const searchParams = url.searchParams.toString();
  const method = request.method;
  const clientIP = getClientIP(request);

  console.log(`[WAF Edge Function] ${method} ${path} from ${clientIP}${searchParams ? `?${searchParams.substring(0, 100)}` : ''}`);

  // 1. Block sensitive files
  if (detectThreat(path, THREAT_PATTERNS.sensitiveFiles)) {
    console.error(`[WAF Edge Function] BLOCKED - Sensitive file: ${path} from ${clientIP}`);
    return new Response('Not Found', { status: 404 });
  }

  // 2. Check path for threats
  if (detectThreat(path, THREAT_PATTERNS.pathTraversal)) {
    console.error(`[WAF Edge Function] BLOCKED - Path traversal: ${path} from ${clientIP}`);
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

  // 3. Check query parameters for threats
  if (searchParams) {
    let decodedParams = searchParams;
    try {
      decodedParams = decodeURIComponent(searchParams);
    } catch {
      decodedParams = searchParams;
    }

    const hasSQLInjection =
      detectThreat(searchParams, THREAT_PATTERNS.sqlInjection) ||
      detectThreat(decodedParams, THREAT_PATTERNS.sqlInjection);

    const hasXSS =
      detectThreat(searchParams, THREAT_PATTERNS.xss) ||
      detectThreat(decodedParams, THREAT_PATTERNS.xss);

    const hasCommandInjection =
      detectThreat(searchParams, THREAT_PATTERNS.commandInjection) ||
      detectThreat(decodedParams, THREAT_PATTERNS.commandInjection);

    if (hasSQLInjection || hasXSS || hasCommandInjection) {
      const threatType = hasSQLInjection ? 'SQL Injection' : hasXSS ? 'XSS' : 'Command Injection';
      console.error(`[WAF Edge Function] BLOCKED - ${threatType}: ${searchParams.substring(0, 200)} from ${clientIP}`);
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

  // Request passed all checks - forward to your app
  console.log(`[WAF Edge Function] ALLOWED - ${method} ${path} from ${clientIP}`);
  
  // For Vite SPA, we need to serve index.html for all routes (client-side routing)
  // But first check if it's a static file request
  const isStaticFile = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|webmanifest)$/i.test(path);
  
  if (isStaticFile) {
    // For static files, let Vercel handle them normally
    // We'll return undefined to let the request pass through
    // Actually, we need to fetch the static file
    const origin = url.origin;
    try {
      const response = await fetch(`${origin}${path}${searchParams ? `?${searchParams}` : ''}`, {
        method: request.method,
        headers: request.headers,
      });
      return response;
    } catch {
      return new Response('Not Found', { status: 404 });
    }
  }
  
  // For all other routes, serve index.html (SPA routing)
  const origin = url.origin;
  try {
    const response = await fetch(`${origin}/index.html`, {
      method: 'GET',
      headers: request.headers,
    });
    return response;
  } catch (error) {
    console.error('[WAF Edge Function] Error serving index.html:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
