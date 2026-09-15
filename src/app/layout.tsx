import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";
import { site } from "@/data/site";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const title = "Kenny · AI Engineer";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description: site.pitch,
  openGraph: {
    title,
    description: site.pitch,
    url: site.url,
    siteName: title,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.pitch,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} bg-surface font-sans text-ink antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <MotionConfig reducedMotion="user">
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-contrast"
            >
              Skip to content
            </a>
            {children}
          </MotionConfig>
        </ThemeProvider>
      </body>
    </html>
  );
}
