import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/candidate/",
        "/recruiter/",
        "/login",
        "/register",
        "/signup",
        "/verify-email",
        "/forgot-password",
        "/reset-password",
        "/uploads/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
