import { NextResponse } from "next/server";

const COOKIE_NAME = "session";

const publicPaths = ["/", "/login", "/register"];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  if (publicPaths.includes(pathname) || request.cookies.has(COOKIE_NAME)) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = { matcher: ["/((?!api|_next|.*\\..*).*)"] };
