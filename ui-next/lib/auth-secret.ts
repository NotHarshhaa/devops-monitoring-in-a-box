/**
 * Single source of truth for the NextAuth signing secret.
 *
 * NextAuth, the proxy (middleware) and the API route guards must all use the
 * same secret, otherwise cookies issued at sign-in fail verification later and
 * every API call answers 401.
 *
 * Failure modes are deliberate:
 *  - development: fall back to a well-known value so `next dev` works with no
 *    setup, and warn about it.
 *  - production: no secret means a per-process random value. Sessions then stop
 *    working across restarts, which is a loud but safe failure - far better than
 *    signing tokens with a value that is published in this repository.
 */

const DEV_FALLBACK_SECRET = 'devops-monitoring-dev-only-secret-do-not-use-in-production';

let cachedSecret: string | null = null;
let warned = false;

/**
 * Random base64 string using Web Crypto, which is available in both the Node
 * and Edge runtimes. `proxy.ts` (middleware) runs on Edge, where `node:crypto`
 * is not usable.
 */
function randomSecret(): string {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export function getAuthSecret(): string {
  const configured = process.env.NEXTAUTH_SECRET;

  if (configured && configured.trim().length > 0) {
    return configured;
  }

  if (process.env.NODE_ENV !== 'production') {
    if (!warned) {
      warned = true;
      console.warn(
        '[auth] NEXTAUTH_SECRET is not set; using the development fallback secret. ' +
          'Generate one with: openssl rand -base64 32'
      );
    }
    return DEV_FALLBACK_SECRET;
  }

  if (!cachedSecret) {
    cachedSecret = randomSecret();
    console.error(
      '[auth] NEXTAUTH_SECRET is not set in production. A random secret was generated, ' +
        'so all sessions will be invalidated on restart. Set NEXTAUTH_SECRET.'
    );
  }

  return cachedSecret;
}

/** True when a real secret was supplied via the environment. */
export function hasConfiguredAuthSecret(): boolean {
  return !!process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.trim().length > 0;
}
