import type { Metadata } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

// Latin UI font
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// Bengali font so Bengali input/output renders cleanly everywhere
const bengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-bengali",
});

export const metadata: Metadata = {
  title: {
    default: "Bilingual Multimodal Fake News Detection",
    template: "%s | Fake News Detection",
  },
  description:
    "Bilingual (Bengali/English) multimodal fake news detection for Facebook using text and image analysis. B.Tech IT final-year project.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${bengali.variable}`}>
      <body className="flex min-h-screen flex-col bg-slate-50 font-[family-name:var(--font-inter)] text-slate-900 antialiased">
        {/* Skip link for keyboard / screen-reader users */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-slate-900"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
