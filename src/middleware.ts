import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'vestly_session';

// Paths that require authentication
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/grants',
  '/calculator',
  '/scenarios',
  '/actions',
  '/reports',
  '/pool',
  '/settings',
];

// Auth pages where logged-in users should be redirected away
const AUTH_ROUTES = ['/login', '/register'];

const JWT_SECRET = process.env.JWT_SECRET || 'vestly_dev_secret_key_change_in_production';

function base64UrlToBytes(value: string): ArrayBuffer {
  const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return bytes.buffer as ArrayBuffer;
}

async function isTokenValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const signatureIsValid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlToBytes(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    );
    if (!signatureIsValid) return false;

    const payloadJson = new TextDecoder().decode(base64UrlToBytes(parts[1]));
    const payload = JSON.parse(payloadJson);

    return Boolean(payload.userId) && (!payload.exp || Date.now() < payload.exp * 1000);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = await isTokenValid(token);

  // 1. Check protected routes
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  );

  if (isProtected) {
    if (!authenticated) {
      const returnUrl = encodeURIComponent(pathname + search);
      const loginUrl = new URL(`/login?next=${returnUrl}`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Redirect logged-in users away from /login and /register
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (isAuthRoute && authenticated) {
    const nextParam = request.nextUrl.searchParams.get('next');
    const destination = nextParam && nextParam.startsWith('/') ? nextParam : '/dashboard';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /api/* (API routes handle their own 401 responses)
     * 2. /_next/static (static files)
     * 3. /_next/image (image optimization files)
     * 4. /icon.svg, /favicon.ico, and images
     */
    '/((?!api|_next/static|_next/image|icon\\.svg|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp)$).*)',
  ],
};

