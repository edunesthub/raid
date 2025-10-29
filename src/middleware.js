import { NextResponse } from "next/server";

export function middleware(request) {
  // Remove the automatic redirect to splash
  // Let the app handle navigation naturally
  return NextResponse.next();
}

export const config = {
  matcher: [],
};