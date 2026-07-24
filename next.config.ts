import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Canonicalise: send the old *.vercel.app production URL to the custom
  // domain (afrosamboza.com.ng, live behind Cloudflare). The custom domain
  // itself then handles apex → www internally.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "web-app-beta-olive.vercel.app" }],
        destination: "https://afrosamboza.com.ng/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
