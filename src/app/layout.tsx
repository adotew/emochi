import type { Metadata } from "next";

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
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
