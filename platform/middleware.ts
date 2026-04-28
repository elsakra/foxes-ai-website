import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminJwt, adminCookieName } from "@/lib/admin-auth";

export async function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }
  if (req.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }
  const tok = req.cookies.get(adminCookieName)?.value;
  if (!tok || !(await verifyAdminJwt(tok))) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
