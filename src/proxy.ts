import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "vi"];
const defaultLocale = "en";

function getLocale(request: NextRequest): string {
  // 1. Check user preference cookie
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Parse Accept-Language header
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const preferredLocales = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim().split("-")[0].toLowerCase());

    for (const locale of preferredLocales) {
      if (locales.includes(locale)) {
        return locale;
      }
    }
  }

  // 3. Fallback to default English
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verify if pathname is missing a supported locale prefix
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);

    // Redirect to prefixed pathname
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
        request.url
      )
    );
  }
}

export const config = {
  matcher: [
    // Bypass all internal folders, API, and static asset lists
    "/((?!api|_next/static|_next/image|favicon.ico|next.svg|vercel.svg|icon.svg|sitemap.xml|robots.txt|.*\\.png).*)",
  ],
};
