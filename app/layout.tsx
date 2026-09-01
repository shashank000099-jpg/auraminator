import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";

export const metadata: Metadata = {
  metadataBase: new URL("https://auraminator.in"),
  title: {
    default: "AURAMINATOR • Sovereign Digital Assets, SaaS, Streetwear & Careers",
    template: "%s • AURAMINATOR",
  },
  description:
    "The premier multi-sided marketplace and escrow protocol. Buy & sell turnkey SaaS, mobile apps, source code IP, social media accounts, luxury 500 GSM streetwear drops, and discover 100% free tech jobs with zero-trust escrow protection.",
  keywords: [
    "auraminator",
    "buy saas startup",
    "turnkey web apps",
    "mobile app source code",
    "micro saas marketplace",
    "youtube channel for sale",
    "instagram accounts marketplace",
    "500 gsm streetwear",
    "heavyweight french terry apparel",
    "emergency debug service",
    "tech jobs india",
    "startup careers",
    "protected escrow commerce",
    "razorpay route split",
    "india",
    "global digital assets",
  ],
  authors: [{ name: "Auraminator Protocol", url: "https://auraminator.in" }],
  creator: "Auraminator Corporation",
  publisher: "Auraminator Protocol",
  applicationName: "AURAMINATOR",
  category: "technology & commerce",
  alternates: {
    canonical: "https://auraminator.in",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "AURAMINATOR • Sovereign Digital Assets, SaaS, Streetwear & Careers",
    description:
      "Buy, negotiate & acquire verified SaaS startups, mobile apps, source code IP, luxury 500 GSM streetwear drops, and tech careers with protected escrow.",
    url: "https://auraminator.in",
    siteName: "AURAMINATOR.IN",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/brand/auraminator-logo-full.svg",
        width: 1200,
        height: 630,
        alt: "AURAMINATOR Sovereign Digital Asset Protocol",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AURAMINATOR • Sovereign Digital Assets, SaaS, Streetwear & Careers",
    description:
      "Buy, negotiate & acquire verified SaaS startups, mobile apps, source code IP, luxury streetwear, and tech jobs with protected escrow.",
    creator: "@auraminator",
    images: ["/brand/auraminator-logo-full.svg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "Odwn0BatC93QAbmxMnS4Mxl88gxezbM5wPctMFDgM8s",
  },
  other: {
    "geo.region": "IN",
    "geo.placename": "India",
    "geo.position": "28.6139;77.2090",
    ICBM: "28.6139, 77.2090",
    "DC.title": "AURAMINATOR",
    "DC.creator": "Auraminator Protocol",
    "DC.language": "en",
    "theme-color": "#000000",
  },
};

import { AuthProvider } from "@/lib/context/auth-context";
import { AppLaunchSplash } from "@/components/app-launch-splash";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const globalSchemaJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://auraminator.in/#organization",
        name: "AURAMINATOR",
        url: "https://auraminator.in",
        logo: "https://auraminator.in/brand/auraminator-icon.svg",
        sameAs: [
          "https://twitter.com/auraminator",
          "https://github.com/auraminator",
          "https://instagram.com/auraminator.in",
        ],
        description:
          "Sovereign multi-sided commerce, digital asset brokerage, and career protocol with protected escrow.",
      },
      {
        "@type": "WebSite",
        "@id": "https://auraminator.in/#website",
        url: "https://auraminator.in",
        name: "AURAMINATOR.IN",
        publisher: {
          "@id": "https://auraminator.in/#organization",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: "https://auraminator.in/explore?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalSchemaJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col justify-between">
        <AuthProvider>
          <AppLaunchSplash />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </AuthProvider>
      </body>
    </html>
  );
}
