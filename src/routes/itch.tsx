import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell, PageHeader } from "@/components/PageShell";
import { GameCard } from "@/components/GameCard";
import { fetchGames } from "@/lib/queries";

export const Route = createFileRoute("/itch")({
  component: ItchPage,
  head: () => ({
    meta: [
      { title: "Jogos grátis no Itch.io — Set Games" },
      { name: "description", content: "Jogos indies pagos liberados gratuitamente por tempo limitado no Itch.io." },
      { property: "og:title", content: "Jogos grátis no Itch.io — Set Games" },
      { property: "og:description", content: "Jogos indies pagos liberados gratuitamente por tempo limitado no Itch.io." },
      { property: "og:url", content: "https://setgames.lovable.app/itch" },
    ],
    links: [{ rel: "canonical", href: "https://setgames.lovable.app/itch" }],
  }),
});

function ItchPage() {
  const { data: list = [], isLoading } = useQuery({ queryKey: ["games", "itch"], queryFn: () => fetchGames("itch") });
  return (
    <PageShell>
      <PageHeader
        eyebrow="Itch.io"
        title="Indies pagos liberados"
        description="O lado mais criativo dos jogos. Promoções 100% off com curadoria de autor."
      />
      <section className="container mx-auto px-4 py-10 sm:px-6 sm:py-12">
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
