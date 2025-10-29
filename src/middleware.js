import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if user has seen splash screen in this session
  const hasSeenSplash = request.cookies.get('splash_seen');

  // If accessing root and haven't seen splash, redirect to splash
  if (pathname === "/" && !hasSeenSplash) {
    const url = request.nextUrl.clone();
    url.pathname = "/splash";
    return NextResponse.redirect(url);
  }

  // If on splash page, set the cookie
  if (pathname === "/splash") {
    const response = NextResponse.next();
    // Cookie expires when browser closes (session cookie)
    response.cookies.set('splash_seen', 'true', {
      path: '/',
      sameSite: 'lax',
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/splash"],
};
