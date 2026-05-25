import { createFileRoute } from "@tanstack/react-router";
import { runSync } from "@/lib/sync.server";

export const Route = createFileRoute("/api/public/sync-games")({
  server: {
    handlers: {
      POST: async ({ request }) => {
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
