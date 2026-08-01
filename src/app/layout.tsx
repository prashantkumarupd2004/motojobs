import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Motojobs.in — India's Automobile Sector Job Portal",
  description: "India's dedicated job portal for the automobile sector. Jobs at car and two-wheeler dealerships, service centres, workshops, OEMs and EV companies — Sales Consultant, Service Advisor, Technician, Workshop Manager and more.",
  keywords: "automobile jobs, automotive jobs India, dealership jobs, service advisor jobs, car showroom jobs, automobile technician, ITI jobs, workshop jobs, EV jobs, two wheeler mechanic jobs",
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
