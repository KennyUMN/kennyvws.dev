import type { Metadata, Viewport } from "next";
import { Martian_Mono, Mona_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { MotionProvider } from "@/components/MotionProvider";
import { site } from "@/data/site";
import "./globals.css";

const mona = Mona_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-mona",
  display: "swap",
});

const martian = Martian_Mono({
  subsets: ["latin"],
  variable: "--font-martian",
  display: "swap",
  preload: false,
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#efefec" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e0d" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${mona.variable} ${martian.variable} bg-surface font-sans text-ink antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <MotionProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-ink"
            >
              Skip to content
            </a>
            {children}
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
