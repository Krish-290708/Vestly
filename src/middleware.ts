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

function isTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  try {
    // Decode JWT payload (middle segment) without heavy crypto in Edge runtime
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
    const payload = JSON.parse(payloadJson);
    if (!payload.userId) return false;
    // Check expiration if present
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = isTokenValid(token);

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

