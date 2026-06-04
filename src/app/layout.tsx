import type { Metadata } from "next";
import Script from "next/script";

import "./globals.css";

export const metadata: Metadata = {
  title: "Emochi Live",
  description: "Eine minimale Realtime-App mit Supabase, einem Eingabefeld und einem Submit-Button.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(() => {
            const storageKey = "emochi-theme";
            const storedTheme = localStorage.getItem(storageKey);
            const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            const theme = storedTheme === "light" || storedTheme === "dark"
              ? storedTheme
              : systemPrefersDark
                ? "dark"
                : "light";
            document.documentElement.dataset.theme = theme;
          })();`}
        </Script>
        {children}
      </body>
    </html>
  );
}
