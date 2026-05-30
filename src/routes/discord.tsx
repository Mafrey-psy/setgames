import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell, PageHeader } from "@/components/PageShell";
import { GameCard } from "@/components/GameCard";
import { fetchGames } from "@/lib/queries";

export const Route = createFileRoute("/discord")({
  component: DiscordPage,
  head: () => ({
    meta: [
      { title: "Jogos grátis no Discord — Set Games" },
      { name: "description", content: "Jogos pagos liberados gratuitamente via Discord e Nitro." },
      { property: "og:title", content: "Jogos grátis no Discord — Set Games" },
      { property: "og:description", content: "Jogos pagos liberados gratuitamente via Discord e Nitro." },
      { property: "og:url", content: "https://setgames.lovable.app/discord" },
    ],
    links: [{ rel: "canonical", href: "https://setgames.lovable.app/discord" }],
  }),
});

function DiscordPage() {
  const { data: list = [], isLoading } = useQuery({ queryKey: ["games", "discord"], queryFn: () => fetchGames("discord") });
  return (
    <PageShell>
      <PageHeader
        eyebrow="Discord"
        title="Brindes do Discord"
        description="Jogos pagos liberados via Discord, drops do Nitro e promoções da loja."
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
