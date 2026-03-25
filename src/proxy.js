import { NextResponse } from 'next/server';

const PROTECTED_ROUTES = [
  '/profile',
  '/wallet',
  '/deposit',
  '/payment',
  '/chat',
  '/challenges',
  '/notifications',
  '/team-manager',
  '/admin'
];

const AUTH_ROUTES = [
  '/auth/login',
  '/auth/signup',
  '/auth/reset',
  '/auth/onboarding'
];

export async function proxy(req) {
  const token = req.cookies.get('session-token')?.value;
  const { pathname } = req.nextUrl;

  // Check if route is protected
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAuth = AUTH_ROUTES.some(route => pathname.startsWith(route));

  // Redirect to login if accessing protected route without token
  if (isProtected && !token) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to home if already logged in and accessing auth routes
  if (isAuth && token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
