const isProduction = process.env.VERCEL_ENV === 'production';

const ALLOWED_ORIGINS = [
  /^https:\/\/chromatix\.app$/,
  /^https:\/\/.*\.vercel\.app$/,
  ...(isProduction ? [] : [/^http:\/\/localhost:\d+$/]),
];

/**
 * Checks the request's Origin (falling back to Referer) against a fixed
 * allowlist of known app origins: production, Vercel previews, and — outside
 * of production — localhost, for local development.
 */
export function isAllowedOrigin(request: Request): boolean {
  return getRequestOrigin(request) !== null;
}

/**
 * Builds CORS headers that reflect the request's origin back only when it's
 * in the allowlist, rather than a blanket wildcard, so the CORS policy
 * matches the actual access rule instead of relying solely on the 403 check.
 */
export function getCorsHeaders(request: Request, extraHeaders: Record<string, string> = {}): Record<string, string> {
  const origin = getRequestOrigin(request);

  return {
    Vary: 'Origin',
    ...(origin && { 'Access-Control-Allow-Origin': origin }),
    ...extraHeaders,
  };
}

function getRequestOrigin(request: Request): string | null {
  const origin = request.headers.get('origin') ?? request.headers.get('referer');

  if (!origin) {
    return null;
  }

  try {
    const originUrl = new URL(origin).origin;
    return ALLOWED_ORIGINS.some((pattern) => pattern.test(originUrl)) ? originUrl : null;
  } catch {
    return null;
  }
}

/**
 * Checks the request's x-api-key header against the given expected key.
 * Fails closed: returns false if the expected key is not configured.
 */
export function isValidApiKey(request: Request, expectedKey: string | undefined): boolean {
  if (!expectedKey) {
    return false;
  }

  return request.headers.get('x-api-key') === expectedKey;
}
