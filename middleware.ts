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
  // /compte n'est plus protégé ici : la page gère déjà l'état non
  // connecté elle-même (message inline), pas de garde Edge nécessaire
  // pour une route aussi peu sensible.
  matcher: ["/admin/:path*", "/artiste/revenus/:path*"],
};
