import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const CANONICAL_HOST = "www.explora-school.es";

/** Old brand domains → permanent redirect to the new site. */
const LEGACY_HOSTS = new Set([
  "sierranevadaclases.es",
  "www.sierranevadaclases.es",
  "explora-school.es",
]);

export default function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();

  if (host && LEGACY_HOSTS.has(host)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.host = CANONICAL_HOST;
    redirectUrl.protocol = "https:";
    redirectUrl.port = "";
    return NextResponse.redirect(redirectUrl, 308);
  }

  const response = intlMiddleware(request);

  // next-intl uses 307 for locale prefixing (`/` → `/es`). Canonical locale
  // URLs should be permanent so Google consolidates ranking signals.
  if (response.status === 307 || response.status === 302) {
    const location = response.headers.get("location");
    if (location) {
      return NextResponse.redirect(new URL(location, request.url), 308);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/(es|en)/:path*",
    "/((?!api|admin|__|_next|_vercel|.*\\..*).*)",
  ],
};
