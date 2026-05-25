import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/PageShell";
import { GameCard } from "@/components/GameCard";
import { getByPlatform } from "@/lib/games";

export const Route = createFileRoute("/epic")({
  component: EpicPage,
  head: () => ({
    meta: [
      { title: "Epic Games Grátis — Portal Gamer" },
      { name: "description", content: "Lista atualizada dos jogos grátis da Epic Games Store da semana." },
    ],
  }),
});

function EpicPage() {
  const list = getByPlatform("epic");
  return (
    <PageShell>
      <PageHeader
        eyebrow="Epic Games Store"
        title="Grátis na Epic"
        description="Todas as quintas-feiras a Epic libera jogos por tempo limitado. Aqui está a curadoria atual."
      />
      <section className="container mx-auto px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
