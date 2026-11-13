import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Explicitly define the workspace root directory for Turbopack compilation
    root: __dirname,
  },
  // The app only has /[locale] routes and the locale proxy is disabled.
  // First visit to the bare domain (the URL printed on the CV) → English.
  // Returning visitors who picked a language (NEXT_LOCALE cookie, set by
  // LanguageSwitcher) go back to that language. Rules run top to bottom.
  async redirects() {
    return [
      {
        source: "/",
        has: [{ type: "cookie", key: "NEXT_LOCALE", value: "(?<locale>en|vi)" }],
        destination: "/:locale",
        permanent: false,
      },
      { source: "/", destination: "/en", permanent: false },
    ];
  },
};

export default nextConfig;
