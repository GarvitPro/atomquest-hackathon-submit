import { NextResponse } from "next/server";
import { auth } from "@/auth";

const publicRoutes = ["/login"];

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));
  const isAuthApi = pathname.startsWith("/api/auth");
  const isTrpc = pathname.startsWith("/api/trpc");

  if (isPublic || isAuthApi || isTrpc) {
    return NextResponse.next();
  }

  if (!request.auth) {
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.href);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
