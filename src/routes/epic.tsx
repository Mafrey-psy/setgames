import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell, PageHeader } from "@/components/PageShell";
import { GameCard } from "@/components/GameCard";
import { fetchGames } from "@/lib/queries";

export const Route = createFileRoute("/epic")({
  component: EpicPage,
  head: () => ({
    meta: [
      { title: "Jogos grátis na Epic Games — Set Games" },
      { name: "description", content: "Jogos pagos liberados por tempo limitado na Epic Games Store. Atualizado semanalmente." },
      { property: "og:title", content: "Jogos grátis na Epic Games — Set Games" },
      { property: "og:description", content: "Jogos pagos liberados por tempo limitado na Epic Games Store. Atualizado semanalmente." },
      { property: "og:url", content: "https://setgames.lovable.app/epic" },
    ],
    links: [{ rel: "canonical", href: "https://setgames.lovable.app/epic" }],
  }),
});

function EpicPage() {
  const { data: list = [], isLoading } = useQuery({ queryKey: ["games", "epic"], queryFn: () => fetchGames("epic") });
  return (
    <PageShell>
      <PageHeader
        eyebrow="Epic Games"
        title="Grátis por tempo limitado"
        description="Toda quinta a Epic libera jogos pagos de graça. Resgate antes do prazo e o jogo é seu para sempre."
      />
      <section className="container mx-auto px-6 py-12">
        {isLoading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : list.length === 0 ? (
          <p className="text-muted-foreground">Nenhum jogo grátis no momento.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.map((g) => <GameCard key={g.id} game={g} />)}
          </div>
        )}
      </section>
    </PageShell>
  );
}
