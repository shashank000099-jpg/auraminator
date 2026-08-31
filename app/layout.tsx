import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";

export const metadata: Metadata = {
  title: "AURAMINATOR.IN • Elite Multi-Sided Commerce Engine",
  description: "Enterprise multi-vendor platform for high-tier digital assets, luxury cut-and-sew streetwear drops, and verified creator vaults.",
  keywords: ["auraminator", "brutalism", "streetwear", "digital vault", "creator economy", "escrow commerce"],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  },
  verification: {
    google: "Odwn0BatC93QAbmxMnS4Mxl88gxezbM5wPctMFDgM8s",
  },
};

import { AuthProvider } from "@/lib/context/auth-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col justify-between">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </AuthProvider>
      </body>
    </html>
  );
}
