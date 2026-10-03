import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Cormorant_SC, Libre_Franklin } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/shell/app-shell";
import { Header } from "@/components/shell/header";
import { Footer } from "@/components/shell/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";

// Display editorial de alto contraste, con itálica para el énfasis
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

// Versalitas reales para referencias, capítulos y metadatos
const cormorantSC = Cormorant_SC({
  variable: "--font-cormorant-sc",
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
});

// Grotesca de tradición americana para interfaz y lectura
const franklin = Libre_Franklin({
  variable: "--font-franklin",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hartwell.example"),
  title: {
    default: "HARTWELL · Timeless by design",
    template: "%s · HARTWELL",
  },
  description: "Sastrería, punto y prendas de club desde 1931. Nueva colección The Estate Summer.",
  openGraph: {
    title: "HARTWELL",
    description: "The Estate Summer, la nueva colección de la Casa.",
    images: ["/assets/hartwell/hero/hero-poster.jpg"],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f2ea",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${cormorant.variable} ${cormorantSC.variable} ${franklin.variable}`}>
      <body>
        <AppShell>
          <Header />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </AppShell>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
