import type { Metadata } from "next";
import { DM_Sans, Josefin_Sans } from "next/font/google";
import Topbar from "@/components/Topbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { createSupabaseServer } from "@/lib/supabase/server";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const josefin = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolve auth state on the server so the header always matches the session
  // the rest of the app sees (avoids the "logged in but header says Login" desync).
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isStaff = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isStaff = profile?.role === "staff" || profile?.role === "admin";
  }

  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${josefin.variable}`}
    >
      <body>
        <Topbar initialEmail={user?.email ?? null} initialIsStaff={isStaff} />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
