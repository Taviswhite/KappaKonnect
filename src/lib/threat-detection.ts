/**
 * Client-Side Threat Detection
 * Detects and blocks malicious query parameters in URLs
 */

// Threat patterns
const THREAT_PATTERNS = [
  // SQL Injection
  /('|%27)\s*or\s*1\s*=\s*1/i,
  /('|%27)\s*or\s*1\s*=\s*1--/i,
  /--/i,
  /#/i,
  /\/\*/i,
  /\bunion\b.*\bselect\b/i,
  /\bselect\b.*\bfrom\b/i,
  /\binsert\b.*\binto\b/i,
  /\bdelete\b.*\bfrom\b/i,
  /\bdrop\b.*\btable\b/i,
  /\bexec\b.*\(/i,
  
  // XSS
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
  
  // Command Injection
  /[;&|`]/,
  /\b(cat|ls|pwd|whoami|nc|netcat|curl|wget)\b/i,
  /\$\{/,
  /\$\(/,
  
  // Path Traversal
  /\.\.\//g,
  /\.\.\\/g,
  /\.\.%2f/i,
  /\.\.%5c/i,
];

/**
 * Check if a URL contains malicious patterns
 * @param url - The URL to check (defaults to current window location)
 * @returns true if threat detected, false otherwise
 */
export function detectThreats(url?: string): boolean {
  const urlToCheck = url || window.location.href;
  const urlObj = new URL(urlToCheck);
  const queryString = urlObj.search; // Includes the '?' character
  
  if (!queryString || queryString.length <= 1) {
    return false; // No query parameters
  }
  
  // Remove the '?' for checking
  const queryWithoutQuestion = queryString.substring(1);
  
  // Check both encoded and decoded versions
  let decodedQuery = queryWithoutQuestion;
  try {
    decodedQuery = decodeURIComponent(queryWithoutQuestion);
  } catch {
    // If decoding fails, use original
    decodedQuery = queryWithoutQuestion;
  }
  
  for (const pattern of THREAT_PATTERNS) {
    if (pattern.test(queryWithoutQuestion) || pattern.test(decodedQuery)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check URL for threats and redirect if malicious
 * Call this on app initialization
 */
export function checkURLForThreats(): boolean {
  if (typeof window === 'undefined') {
    return false; // SSR check
  }

  const currentUrl = new URL(window.location.href);

  // Allow known-safe QR check-in URLs for Attendance page
  // Example: /attendance?event=<uuid>&checkin=true
  if (currentUrl.pathname === '/attendance') {
    const params = currentUrl.searchParams;
    const keys = Array.from(params.keys());
    const isQrCheckin =
      params.has('event') &&
      params.has('checkin') &&
      keys.every((k) => k === 'event' || k === 'checkin');

    if (isQrCheckin) {
      return false;
    }
  }

  const hasThreat = detectThreats();
  
  if (hasThreat) {
    // Remove query parameters and redirect to blocked page
    const cleanUrl = window.location.origin + window.location.pathname;
    window.location.replace('/blocked');
    return true;
  }
  
  return false;
}
