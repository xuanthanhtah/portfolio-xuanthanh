"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ComponentProps } from "react";

// Suppress the React 19 script tag warning in development (from next-themes inline script injection)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" && 
      args[0].includes("Encountered a script tag")
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="dark" 
      enableSystem={true}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
