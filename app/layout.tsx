import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";

export const metadata: Metadata = {
  title: "AURAMINATOR.IN • Elite Multi-Sided Commerce Engine",
  description: "Enterprise multi-vendor platform for high-tier digital assets, luxury cut-and-sew streetwear drops, and verified creator vaults.",
  keywords: ["auraminator", "brutalism", "streetwear", "digital vault", "creator economy", "escrow commerce"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col justify-between">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
