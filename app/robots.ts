import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://auraminator.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/explore",
          "/product/",
          "/jobs",
          "/jobs/",
          "/brand",
          "/deals/",
        ],
        disallow: [
          "/api/",
          "/account/services/",
          "/account/orders/",
          "/seller/payouts",
          "/admin/",
          "/auth/callback",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
      },
      {
        userAgent: "Bingbot",
        allow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
