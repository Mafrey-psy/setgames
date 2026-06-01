import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell, PageHeader } from "@/components/PageShell";
import { GameCard } from "@/components/GameCard";
import { fetchGames } from "@/lib/queries";

export const Route = createFileRoute("/steam")({
  component: SteamPage,
  head: () => ({
    meta: [
      { title: "Jogos grátis na Steam — Set Games" },
      { name: "description", content: "Promoções 100% off e fins de semana grátis na Steam, com preço original e prazo claros." },
      { property: "og:title", content: "Jogos grátis na Steam — Set Games" },
      { property: "og:description", content: "Promoções 100% off e fins de semana grátis na Steam, com preço original e prazo claros." },
      { property: "og:url", content: "https://setgames.lovable.app/steam" },
    ],
    links: [{ rel: "canonical", href: "https://setgames.lovable.app/steam" }],
  }),
});

function SteamPage() {
  const { data: list = [], isLoading } = useQuery({ queryKey: ["games", "steam"], queryFn: () => fetchGames("steam") });
  return (
    <PageShell>
      <PageHeader
        eyebrow="Steam"
        title="Jogos grátis na Steam"
        description="Jogos pagos da Steam liberados gratuitamente em janelas específicas. Sem free-to-play."
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
