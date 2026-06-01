import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell, PageHeader } from "@/components/PageShell";
import { GameCard } from "@/components/GameCard";
import { fetchGames } from "@/lib/queries";

export const Route = createFileRoute("/xbox")({
  component: XboxPage,
  head: () => ({
    meta: [
      { title: "Jogos grátis no Xbox / Cloud Gaming — Set Games" },
      { name: "description", content: "Jogos pagos liberados gratuitamente no Xbox, Game Pass e Cloud Gaming." },
      { property: "og:title", content: "Jogos grátis no Xbox / Cloud Gaming — Set Games" },
      { property: "og:description", content: "Jogos pagos liberados gratuitamente no Xbox, Game Pass e Cloud Gaming." },
      { property: "og:url", content: "https://setgames.lovable.app/xbox" },
    ],
    links: [{ rel: "canonical", href: "https://setgames.lovable.app/xbox" }],
  }),
});

function XboxPage() {
  const { data: list = [], isLoading } = useQuery({ queryKey: ["games", "xbox"], queryFn: () => fetchGames("xbox") });
  return (
    <PageShell>
      <PageHeader
        eyebrow="Xbox Cloud Gaming"
        title="Jogos grátis no Xbox Cloud Gaming"
        description="Jogos pagos liberados gratuitamente para Xbox, Game Pass e Cloud Gaming, sem precisar baixar."
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
