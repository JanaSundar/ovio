import type { MetadataRoute } from "next";
import { SITE_URL } from "@/content/components";
import { IS_PRODUCTION } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Preview deployments would otherwise be indexed as duplicates of the real site.
  if (!IS_PRODUCTION) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    // /embed answers for any user or repo, so crawling it only yields endless thin URLs.
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/embed/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
