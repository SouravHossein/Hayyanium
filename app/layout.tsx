import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Syne } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import JsonLd from "@/components/JsonLd";
import MainNav from "@/components/MainNav";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#081220' }
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://hayyanium.vercel.app/"),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hayyanium",
  },
  title: {
    default: "Hayyanium - Interactive Periodic Table",
    template: "%s | Hayyanium"
  },
  description: "Advanced interactive periodic table with detailed element data, 3D atomic structures, chemical compound builder, and historical discovery timelines. Built for science education.",
  keywords: [
    "interactive periodic table", "chemical elements", "atomic properties",
    "electron configuration", "chemistry learning tools", "periodic trends",
    "3D atomic models", "compound builder", "isotopes", "valence electrons",
    "periodic table for students", "science education"
  ],
  authors: [{ name: "Sourav Hossein", url: "https://github.com/SouravHossein" }],
  creator: "Sourav Hossein",
  publisher: "Hayyanium",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Hayyanium - Advanced Visual Science Tool",
    description: "Deep dive into chemical elements with 3D models and real-world applications.",
    type: "website",
    url: "https://hayyanium.vercel.app/",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Hayyanium Dashboard",
      },
    ],
    siteName: "Hayyanium",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hayyanium - Elements & 3D Models",
    description: "Explore the building blocks of the universe with our interactive 3D periodic table.",
    images: ["/og-image.png"],
    creator: "@sourav_hossein",
  },
  alternates: {
    canonical: "https://hayyanium.vercel.app/",
  },
  verification: {
    google: "jSf0-zlaS8N6NhW9JibN7ARfDUvPtgPxJEC8V2CyyLQ",
  },
};

import { AuthProvider } from "@/contexts/AuthContext";
import { Suspense } from "react";

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
        <link rel="preconnect" href="https://raw.githubusercontent.com" />
      </head>
      <body className={`${spaceGrotesk.variable} ${syne.variable}`} suppressHydrationWarning>
        <JsonLd />
        <AuthProvider>
          <ThemeProvider>
            {children}
            <Suspense fallback={null}>
              <MainNav />
            </Suspense>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
