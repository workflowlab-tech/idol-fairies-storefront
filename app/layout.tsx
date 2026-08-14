import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart/context";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";
import { getAllProducts } from "@/lib/products/queries";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Idol Fairies PH — K-pop Albums, Light Sticks & Merch",
    template: "%s · Idol Fairies PH",
  },
  description:
    "Idol Fairies PH is a modern K-pop e-commerce storefront for albums, light sticks, photobooks, and magazines, with Idol AI to help you shop.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Fetched once here (not per-page) so the chat widget can resolve product
  // cards for slugs Idol AI returns without a second round-trip.
  const products = await getAllProducts().catch(() => []);

  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-fairy-cream text-fairy-ink">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ChatWidget products={products} />
        </CartProvider>
      </body>
    </html>
  );
}
