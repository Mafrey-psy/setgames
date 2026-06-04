import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell, PageHeader } from "@/components/PageShell";
import { GameCard } from "@/components/GameCard";
import { fetchOtherGames } from "@/lib/queries";

export const Route = createFileRoute("/outros")({
  component: OutrosPage,
  head: () => ({
    meta: [
      { title: "Outros portais — Jogos grátis fora da Epic e Steam — Set Games" },
      { name: "description", content: "Jogos pagos liberados gratuitamente em GOG, Prime Gaming, Itch.io, Xbox, Discord e outras plataformas." },
      { property: "og:title", content: "Outros portais — Jogos grátis fora da Epic e Steam — Set Games" },
      { property: "og:description", content: "Jogos pagos liberados gratuitamente em GOG, Prime Gaming, Itch.io, Xbox, Discord e outras plataformas." },
      { property: "og:url", content: "https://setgames.lovable.app/outros" },
    ],
    links: [{ rel: "canonical", href: "https://setgames.lovable.app/outros" }],
  }),
});

function OutrosPage() {
  const { data: list = [], isLoading } = useQuery({ queryKey: ["games", "outros"], queryFn: fetchOtherGames });
  return (
    <PageShell>
      <PageHeader
        eyebrow="Outros portais"
        title="Jogos grátis em outros portais"
        description="GOG, Prime Gaming, Itch.io, Xbox, Discord e mais — tudo o que é pago e foi liberado por tempo limitado fora da Epic e Steam, reunido em um só lugar."
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
