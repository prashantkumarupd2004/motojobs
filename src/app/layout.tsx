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

const TITLE = "MotoJobs.in — India's #1 Automobile Job Portal";
const DESCRIPTION =
  "Find automobile jobs across India at car dealerships, two-wheeler showrooms, service centres, OEMs and EV companies. Search Sales Consultant, Service Advisor, Technician, Workshop Manager and 500+ automotive roles.";

const KEYWORDS = [
  // Core
  "automobile jobs India", "automotive jobs India", "car dealership jobs",
  "two wheeler mechanic jobs", "automobile technician jobs", "service advisor jobs India",
  "workshop manager jobs", "ITI automobile jobs", "EV jobs India", "electric vehicle jobs",
  // Roles
  "sales consultant automobile", "parts manager jobs", "BDE automobile", "showroom jobs",
  "auto electrician jobs", "body shop jobs", "paint technician jobs", "diagnostic technician",
  "fleet manager jobs", "service manager automobile", "vehicle inspector jobs",
  "automobile engineer jobs", "quality control automobile", "PDI technician jobs",
  // Cities
  "automobile jobs Delhi", "automobile jobs Mumbai", "automobile jobs Bangalore",
  "automobile jobs Chennai", "automobile jobs Hyderabad", "automobile jobs Pune",
  "automobile jobs Kolkata", "automobile jobs Ahmedabad", "automobile jobs Jaipur",
  "automobile jobs Lucknow", "automobile jobs Chandigarh", "automobile jobs Kochi",
  // OEMs / Brands
  "Maruti Suzuki dealership jobs", "Hyundai showroom jobs", "Tata Motors jobs",
  "Mahindra dealership jobs", "Hero MotoCorp jobs", "Bajaj Auto jobs",
  "Honda Cars jobs", "Toyota dealer jobs", "KIA dealership jobs",
  // Niche
  "automobile fresher jobs", "ITI pass automobile jobs", "diploma automobile jobs",
  "auto ancillary jobs", "spare parts jobs", "automobile MBA jobs",
  "job portal automobile India", "motojobs", "motojobs.in",
].join(", ");

/* ── JSON-LD: Organization ──────────────────────────────────────────── */
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MotoJobs.in",
  url: SITE_URL,
  logo: `${SITE_URL}/logo-motojobs.png`,
  description: DESCRIPTION,
  sameAs: [
    "https://www.linkedin.com/company/motojobs-in",
    "https://twitter.com/motojobsin",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: `${SITE_URL}/contact`,
    availableLanguage: ["English", "Hindi"],
  },
};

/* ── JSON-LD: WebSite + SearchAction (Google Sitelinks Searchbox) ─────── */
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MotoJobs.in",
  url: SITE_URL,
  description: DESCRIPTION,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/jobs?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | MotoJobs.in",
  },
  description: DESCRIPTION,
  keywords: KEYWORDS,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "MotoJobs.in",
    locale: "en_IN",
    url: "/",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/logo-motojobs.png", width: 1341, height: 268, alt: "MotoJobs.in — India's Automobile Job Portal" }],
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="min-h-screen bg-canvas text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
