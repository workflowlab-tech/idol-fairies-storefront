import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart/context";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Idol Fairies — K-pop Albums, Light Sticks & Merch",
    template: "%s · Idol Fairies",
  },
  description:
    "Idol Fairies is your K-pop destination for albums, light sticks, photobooks, collectibles, and more, with Idol AI to help you shop.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-fairy-cream text-fairy-ink">
        <CartProvider>
          <a href="#main-content" className="skip-link">Skip to content</a>
          <Header />
          <main id="main-content" tabIndex={-1} className="flex-1">{children}</main>
          <Footer />
          <ChatWidget />
        </CartProvider>
      </body>
    </html>
  );
}
