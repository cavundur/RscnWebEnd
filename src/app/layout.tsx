import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.scss";
import "../styles/main.scss";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider";

// Fontları optimize et ve sadece gerekli karakterleri yükle
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["monospace"],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "RSC Next.js + WordPress",
  description: "Modern headless WordPress site with Next.js",
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL('https://example.com'),
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://example.com',
    title: 'RSC Next.js + WordPress',
    description: 'Modern headless WordPress site with Next.js',
    siteName: 'RSC Next.js',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RSC Next.js + WordPress',
    description: 'Modern headless WordPress site with Next.js',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

// Revalidate süresini biraz daha uzun tut
export const revalidate = 600; // 10 dakika

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* Preload kritik CSS */}
        {/* <link rel="preload" href="/styles/main.css" as="style" /> */}
        {/* DNS Prefetch ve Preconnect */}
        <link rel="dns-prefetch" href="//cavundur.online" />
        <link rel="preconnect" href="//cavundur.online" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
        >
          <Header />
          <main className="">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
