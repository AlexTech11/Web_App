import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import Topbar from "@/components/Topbar";
import Footer from "@/components/Footer";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "AfroSamboza – Cars, Properties & Ride-Hailing Registration",
    template: "%s | AfroSamboza",
  },
  description:
    "Register your car for Bolt, Uber & inDrive. Buy, sell, or rent cars and properties — all in one trusted platform based in Abuja, Nigeria.",
  keywords: [
    "Bolt registration Nigeria",
    "Uber registration Abuja",
    "inDrive registration",
    "cars for sale Abuja",
    "car rentals Nigeria",
    "properties for sale Abuja",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body>
        <Topbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
