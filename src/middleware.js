import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes, and assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/icon-') ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Get the splash_seen cookie
  const hasSeenSplash = request.cookies.get('splash_seen')?.value === 'true';

  console.log(`[Middleware] Path: ${pathname}, HasSeenSplash: ${hasSeenSplash}`);

  // Pages that should NOT redirect to splash
  const excludedPaths = [
    '/splash',
    '/welcome',
    '/auth/login',
    '/auth/signup',
    '/auth/reset',
    '/auth/onboarding',
    '/terms-of-service',
    '/privacy-policy'
  ];

  const isExcluded = excludedPaths.some(path => pathname.startsWith(path));

  // If accessing any page (except excluded) and haven't seen splash, redirect to splash
  if (!isExcluded && !hasSeenSplash) {
    console.log(`[Middleware] Redirecting ${pathname} to /splash`);
    const url = request.nextUrl.clone();
    url.pathname = "/splash";
    return NextResponse.redirect(url);
  }

  // If on splash page, set the cookie and continue
  if (pathname === "/splash") {
    console.log('[Middleware] Setting splash_seen cookie');
    const response = NextResponse.next();
    response.cookies.set('splash_seen', 'true', {
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: 'lax',
      httpOnly: false,
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.json, sw.js
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)',
  ],
};