import type { MetadataRoute } from "next";
import { COMPONENTS, SITE_URL } from "@/content/components";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, priority: 1 },
    ...COMPONENTS.map((c) => ({
      url: `${SITE_URL}/docs/${c.slug}`,
      priority: 0.8,
    })),
  ];
}
