import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_admin/admin/subscribers")({
  component: AdminSubs,
});

function AdminSubs() {
  const { data: rows = [] } = useQuery({
    queryKey: ["admin-subs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Newsletter</h1>
      <p className="mt-1 text-sm text-muted-foreground">{rows.length} inscritos.</p>
      <ul className="mt-6 divide-y divide-border rounded-xl border border-border bg-card">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between p-4 text-sm">
            <span>{r.email}</span>
            <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("pt-BR")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
