import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { AdSenseScript } from "@/components/ads/AdSenseScript";
import { LayoutAds, SidebarAds } from "@/components/ads/LayoutAds";
import { SidebarNav } from "@/components/SidebarNav";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  getAdSenseVerification,
  getSiteUrl,
} from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const adsenseVerification = getAdSenseVerification();

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },
  ...(adsenseVerification
    ? {
        verification: {
          google: adsenseVerification,
        },
      }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AdSenseScript />
        <div className="min-h-screen bg-zinc-50 text-zinc-900">
          <header className="border-b border-zinc-200 bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-lg font-semibold tracking-tight">
                Format Merge
              </Link>
              <p className="hidden text-sm text-zinc-500 sm:block">
                Convert and merge CSV, JSON, and XML
              </p>
            </div>
          </header>

          <LayoutAds />

          <div className="mx-auto flex max-w-7xl gap-8 px-6 py-8">
            <aside className="hidden w-60 shrink-0 md:block">
              <SidebarNav />
              <SidebarAds />
            </aside>

            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
