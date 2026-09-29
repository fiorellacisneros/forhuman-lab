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

const siteTitle = "forHuman Sessions - ¿IA fuimos?";
const siteDescription =
  "Encuentro presencial en Lima sobre salud mental en tiempos de IA: compararnos, burnout y lo que no contamos en LinkedIn. 15 o 16 de octubre, 6 pm (tentativo).";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    siteName: "forHuman Sessions",
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
        <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
          <filter id="shs-duotone" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncR type="linear" slope="1.35" intercept="-0.12" />
              <feFuncG type="linear" slope="1.35" intercept="-0.12" />
              <feFuncB type="linear" slope="1.35" intercept="-0.12" />
            </feComponentTransfer>
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="noise" />
            <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0.9 0 0 0 0" result="grain" />
            <feComposite in="SourceGraphic" in2="noise" operator="arithmetic" k1="0" k2="1" k3="0.55" k4="-0.275" result="noisy" />
            <feComponentTransfer in="noisy">
              <feFuncR type="linear" slope="2.6" intercept="-0.75" />
              <feFuncG type="linear" slope="2.6" intercept="-0.75" />
              <feFuncB type="linear" slope="2.6" intercept="-0.75" />
            </feComponentTransfer>
            <feComponentTransfer>
              <feFuncR type="table" tableValues="0.004 0.87" />
              <feFuncG type="table" tableValues="0.18 0.89" />
              <feFuncB type="table" tableValues="0.86 0.98" />
            </feComponentTransfer>
          </filter>
        </svg>
        {children}
        <AgentationProvider />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
