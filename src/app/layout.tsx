import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const TITLE = "Motojobs.in — India's Automobile Sector Job Portal";
const DESCRIPTION =
  "India's dedicated job portal for the automobile sector. Jobs at car and two-wheeler dealerships, service centres, workshops, OEMs and EV companies — Sales Consultant, Service Advisor, Technician, Workshop Manager and more.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Motojobs.in",
  },
  description: DESCRIPTION,
  keywords: "automobile jobs, automotive jobs India, dealership jobs, service advisor jobs, car showroom jobs, automobile technician, ITI jobs, workshop jobs, EV jobs, two wheeler mechanic jobs",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Motojobs.in",
    locale: "en_IN",
    url: "/",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/logo-motojobs.png", width: 1341, height: 268, alt: "Motojobs.in" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/logo-motojobs.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="min-h-screen bg-canvas text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
