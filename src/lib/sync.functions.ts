import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { runSync } from "@/lib/sync.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const triggerSync = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: roles } = await context.supabase
      .from("user_roles").select("role").eq("user_id", context.userId);
    if (!roles?.some((r: any) => r.role === "admin")) {
      throw new Error("Acesso negado");
    }
    return runSync("manual");
  });

export const listSyncLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: roles } = await context.supabase
      .from("user_roles").select("role").eq("user_id", context.userId);
    if (!roles?.some((r: any) => r.role === "admin")) throw new Error("Acesso negado");
    const { data, error } = await supabaseAdmin
      .from("sync_logs").select("*").order("created_at", { ascending: false }).limit(20);
    if (error) throw error;
    return data;
  });
