import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const description =
  "I build machine learning systems end to end — computer vision and LLM tooling, from the training loop to the server that keeps it running.";

export const metadata: Metadata = {
  metadataBase: new URL("https://kennyvws.dev"),
  title: "Kenny — AI Engineer",
  description,
  openGraph: {
    title: "Kenny — AI Engineer",
    description,
    url: "https://kennyvws.dev",
    siteName: "Kenny — AI Engineer",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kenny — AI Engineer",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} bg-surface font-sans text-ink antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MotionConfig reducedMotion="user">
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
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
