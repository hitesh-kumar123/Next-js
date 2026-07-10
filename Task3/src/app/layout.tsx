import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://thinkauric.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Auric — Gym & Fitness Studio SaaS",
    template: "%s | Auric",
  },
  description:
    "Auric is a gym and fitness studio management platform: Authorize.net billing, camera QR check-ins, tokenized waivers, and custom subdomains for gym owners.",
  keywords: [
    "gym management software",
    "fitness studio SaaS",
    "gym billing software",
    "QR check-in gym",
    "gym membership platform",
  ],
  authors: [{ name: "Auric" }],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Auric",
    title: "Auric — Gym & Fitness Studio SaaS",
    description:
      "Run your gym without the spreadsheets. Automated billing, QR check-ins, and waivers in one dashboard.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Auric gym management dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Auric — Gym & Fitness Studio SaaS",
    description:
      "Run your gym without the spreadsheets. Automated billing, QR check-ins, and waivers in one dashboard.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBF7F0" },
    { media: "(prefers-color-scheme: dark)", color: "#1B2432" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-background text-on-surface font-sans">
        {children}
      </body>
    </html>
  );
}