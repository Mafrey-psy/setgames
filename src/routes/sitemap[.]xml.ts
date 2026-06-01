import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BASE_URL = "https://setgames.lovable.app";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/epic", changefreq: "daily", priority: "0.9" },
          { path: "/steam", changefreq: "daily", priority: "0.9" },
          { path: "/gog", changefreq: "daily", priority: "0.9" },
          { path: "/prime", changefreq: "daily", priority: "0.9" },
          { path: "/xbox", changefreq: "daily", priority: "0.9" },
          { path: "/itch", changefreq: "daily", priority: "0.9" },
          { path: "/discord", changefreq: "daily", priority: "0.9" },
          { path: "/guias", changefreq: "monthly", priority: "0.7" },
          { path: "/cultura", changefreq: "weekly", priority: "0.8" },
          { path: "/sobre", changefreq: "yearly", priority: "0.5" },
          { path: "/login", changefreq: "yearly", priority: "0.2" },
        ];

        try {
          const { data } = await supabaseAdmin
            .from("games")
            .select("id, updated_at")
            .eq("published", true);
          for (const g of data ?? []) {
            entries.push({
              path: `/jogos/${g.id}`,
              lastmod: g.updated_at ? new Date(g.updated_at).toISOString().slice(0, 10) : undefined,
              changefreq: "weekly",
              priority: "0.7",
            });
          }
        } catch { /* sitemap should still render */ }

        try {
          const { data } = await supabaseAdmin
            .from("guides")
            .select("id")
            .eq("published", true);
          for (const g of data ?? []) {
            entries.push({
              path: `/guias/${g.id}`,
              changefreq: "monthly",
              priority: "0.6",
            });
          }
        } catch { /* sitemap should still render */ }

        try {
          const { data } = await supabaseAdmin
            .from("culture_posts")
            .select("slug, published_at")
            .eq("published", true);
          for (const p of data ?? []) {
            entries.push({
              path: `/cultura/${p.slug}`,
              lastmod: new Date(p.published_at).toISOString().slice(0, 10),
              changefreq: "monthly",
              priority: "0.6",
            });
          }
        } catch { /* sitemap should still render */ }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ].filter(Boolean).join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
