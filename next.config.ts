import type { NextConfig } from "next";
import { DOCS_HREF } from "./content/components";

const nextConfig: NextConfig = {
  redirects: async () => [{ source: "/docs", destination: DOCS_HREF, permanent: false }],
};

export default nextConfig;
