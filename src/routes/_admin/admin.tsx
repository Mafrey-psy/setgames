import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_admin/admin")({
  component: Dashboard,
});

async function fetchCounts() {
  const [g, gu, c, s] = await Promise.all([
    supabase.from("games").select("*", { count: "exact", head: true }),
    supabase.from("guides").select("*", { count: "exact", head: true }),
    supabase.from("culture_posts").select("*", { count: "exact", head: true }),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
  ]);
  return { games: g.count ?? 0, guides: gu.count ?? 0, culture: c.count ?? 0, subscribers: s.count ?? 0 };
}

function Dashboard() {
  const { data } = useQuery({ queryKey: ["admin-counts"], queryFn: fetchCounts });
  const stats = [
    { label: "Jogos", value: data?.games ?? "—" },
    { label: "Guias", value: data?.guides ?? "—" },
    { label: "Artigos", value: data?.culture ?? "—" },
    { label: "Inscritos", value: data?.subscribers ?? "—" },
  ];
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Visão geral do portal.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
