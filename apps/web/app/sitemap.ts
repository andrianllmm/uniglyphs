import { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_UNIGLYPHS_WEBSITE_URL;
  if (!siteUrl) {
    throw new Error("NEXT_UNIGLYPHS_WEBSITE_URL is not defined.");
  }

  const routes = ["/", "/privacy", "/terms", "/contact"];

  const staticRoutes = routes.map((route) => ({
    url: new URL(route, siteUrl).href,
    lastModified: new Date().toISOString(),
  }));

  return staticRoutes;
}
