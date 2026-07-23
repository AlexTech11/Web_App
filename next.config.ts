import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // ── Custom domain behind Cloudflare — PLACEHOLDER ──
  // When afrosamboza.com.ng is purchased and proxied through Cloudflare
  // (orange cloud — this also fixes ISPs that can't reach *.vercel.app):
  //
  //   1. Vercel → Project → Settings → Domains → add afrosamboza.com.ng.
  //   2. In Cloudflare DNS, point the domain at Vercel (CNAME to
  //      cname.vercel-dns.com) with the proxy ON.
  //   3. Set NEXT_PUBLIC_SITE_URL=https://afrosamboza.com.ng in Vercel and
  //      update Supabase Auth Site URL / redirect URLs to the new domain.
  //   4. Uncomment the redirect below to send the vercel.app URL to the
  //      canonical domain.
  //
  // async redirects() {
  //   return [
  //     {
  //       source: "/:path*",
  //       has: [{ type: "host", value: "web-app-beta-olive.vercel.app" }],
  //       destination: "https://afrosamboza.com.ng/:path*",
  //       permanent: true,
  //     },
  //   ];
  // },
};

export default nextConfig;
