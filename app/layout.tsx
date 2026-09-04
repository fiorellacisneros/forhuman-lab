import type { Metadata } from "next";
import { Manrope, Work_Sans, Inconsolata, Reenie_Beanie } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { AgentationProvider } from "@/components/AgentationProvider";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const inconsolata = Inconsolata({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const reenieBeanie = Reenie_Beanie({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-accent",
  display: "swap",
});

const siteTitle = "forHuman Lab";
const siteDescription = "Experimentación de productos con IA.";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    siteName: siteTitle,
    locale: "es",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${manrope.variable} ${workSans.variable} ${inconsolata.variable} ${reenieBeanie.variable}`}
    >
      <body className="font-[family-name:var(--font-body)] antialiased">
        {children}
        <AgentationProvider />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
