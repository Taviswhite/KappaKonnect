/**
 * Test endpoint to verify WAF Edge Function is running
 * Access: /api/test-waf
 */
export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request): Promise<Response> {
  return new Response(
    JSON.stringify({
      message: 'WAF Edge Function is running!',
      timestamp: new Date().toISOString(),
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
