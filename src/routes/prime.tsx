import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell, PageHeader } from "@/components/PageShell";
import { GameCard } from "@/components/GameCard";
import { fetchGames } from "@/lib/queries";

export const Route = createFileRoute("/prime")({
  component: PrimePage,
  head: () => ({
    meta: [
      { title: "Jogos grátis no Prime Gaming — Set Games" },
      { name: "description", content: "Jogos pagos liberados gratuitamente para assinantes do Amazon Prime Gaming." },
      { property: "og:title", content: "Jogos grátis no Prime Gaming — Set Games" },
      { property: "og:description", content: "Jogos pagos liberados gratuitamente para assinantes do Amazon Prime Gaming." },
      { property: "og:url", content: "https://setgames.lovable.app/prime" },
    ],
    links: [{ rel: "canonical", href: "https://setgames.lovable.app/prime" }],
  }),
});

function PrimePage() {
  const { data: list = [], isLoading } = useQuery({ queryKey: ["games", "amazon"], queryFn: () => fetchGames("amazon") });
  return (
    <PageShell>
      <PageHeader
        eyebrow="Amazon Prime Gaming"
        title="Jogos grátis no Prime Gaming"
        description="Jogos pagos liberados todo mês para assinantes Amazon Prime. Resgate enquanto estão disponíveis."
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
