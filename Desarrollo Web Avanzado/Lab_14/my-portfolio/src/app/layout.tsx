import type { Metadata } from "next";
import { Anton, Space_Mono, Inter } from "next/font/google";
import "@/styles/globals.scss";
import SmoothScroll from "@/components/providers/SmoothScroll";
import Nav from "@/components/layout/Nav";
import { SITE_CONFIG } from "@/lib/constants";

const display = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const mono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.title,
    template: `%s — ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "desarrollador full stack",
    "aplicaciones empresariales",
    "NestJS",
    "React",
    "PostgreSQL",
    "FastAPI",
    "Django",
    "TypeScript",
    "Python",
    "portafolio",
  ],
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: SITE_CONFIG.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE_CONFIG.name,
  jobTitle: SITE_CONFIG.role,
  url: SITE_CONFIG.url,
  email: SITE_CONFIG.email,
  sameAs: [SITE_CONFIG.links.github, SITE_CONFIG.links.linkedin],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${mono.variable} ${sans.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SmoothScroll>
          <Nav />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
