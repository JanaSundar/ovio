import type { NextConfig } from "next";
import { DOCS_HREF } from "./content/components";

const nextConfig: NextConfig = {
  // Vercel's deployment environment ("production", "preview"), baked into the client build so
  // analytics only runs on the production site. Unset locally.
  env: { NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV ?? "" },
  redirects: async () => [{ source: "/docs", destination: DOCS_HREF, permanent: false }],
};

export default nextConfig;
