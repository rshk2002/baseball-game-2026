import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/play`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/ranking`,
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/instruction`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
