import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (pathname.startsWith("/artiste/revenus") && role !== "artist" && role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  // /artiste/[id] (profil public) reste volontairement HORS de ce
  // matcher : n'importe qui doit pouvoir le consulter.
  matcher: ["/admin/:path*", "/artiste/revenus/:path*", "/compte/:path*"],
};
