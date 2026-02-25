import type { Metadata } from "next";
import { DM_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "MAX STARR ★ — Personal Focus OS",
  description: "A personal project manager and focus tracking system",
  keywords: ["productivity", "project manager", "focus", "tasks"],
  authors: [{ name: "Max Starr" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body
        className={`${dmSans.variable} ${spaceMono.variable} antialiased`}
        style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
      >
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
