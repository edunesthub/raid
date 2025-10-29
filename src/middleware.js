import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Redirect ONLY if user is literally at root "/"
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/splash";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Explicitly restrict it to the root path
export const config = {
  matcher: ["/"], // ✅ this works, but make sure you don't have `/(.*)` or similar
};
