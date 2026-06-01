import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell, PageHeader } from "@/components/PageShell";
import { GameCard } from "@/components/GameCard";
import { fetchGames } from "@/lib/queries";

export const Route = createFileRoute("/gog")({
  component: GogPage,
  head: () => ({
    meta: [
      { title: "Jogos grátis na GOG — Set Games" },
      { name: "description", content: "Jogos pagos liberados gratuitamente na GOG, sem DRM e seus para sempre." },
      { property: "og:title", content: "Jogos grátis na GOG — Set Games" },
      { property: "og:description", content: "Jogos pagos liberados gratuitamente na GOG, sem DRM e seus para sempre." },
      { property: "og:url", content: "https://setgames.lovable.app/gog" },
    ],
    links: [{ rel: "canonical", href: "https://setgames.lovable.app/gog" }],
  }),
});

function GogPage() {
  const { data: list = [], isLoading } = useQuery({ queryKey: ["games", "gog"], queryFn: () => fetchGames("gog") });
  return (
    <PageShell>
      <PageHeader
        eyebrow="GOG"
        title="Jogos grátis na GOG"
        description="Promoções 100% off e brindes na GOG. Baixe o instalador e fique com o jogo, sem DRM e sem clientes obrigatórios."
      />
      <section className="container mx-auto px-4 py-10 sm:px-6 sm:py-12">
        <h2 className="mb-6 font-display text-xl font-bold sm:text-2xl">Disponíveis agora</h2>
        {isLoading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : list.length === 0 ? (
          <p className="text-muted-foreground">Nenhum jogo grátis no momento.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {list.map((g) => <GameCard key={g.id} game={g} />)}
          </div>
        )}
      </section>
    </PageShell>
  );
}
