import { createFileRoute } from "@tanstack/react-router";
import { runSync } from "@/lib/sync.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { timingSafeEqual } from "crypto";

async function getCronSecret(): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("app_secrets")
    .select("value")
    .eq("key", "cron_secret")
    .maybeSingle();
  return data?.value ?? null;
}

export const Route = createFileRoute("/api/public/sync-games")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const provided = request.headers.get("x-cron-secret") ?? "";
        const expected = await getCronSecret();
        if (!expected) {
          return Response.json({ ok: false, error: "Cron secret not configured" }, { status: 500 });
        }
        const a = Buffer.from(provided);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Unauthorized", { status: 401 });
        }

        let trigger = "cron";
        try {
          const body = await request.json();
          if (body?.trigger) trigger = String(body.trigger).slice(0, 32);
        } catch { /* ignore */ }
        try {
          const result = await runSync(trigger);
          return Response.json({ ok: true, ...result });
        } catch (e: any) {
          return Response.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
        }
      },
    },
  },
});
