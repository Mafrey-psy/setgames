import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/PageShell";
import { GameCard } from "@/components/GameCard";
import { getByPlatform } from "@/lib/games";

export const Route = createFileRoute("/steam")({
  component: SteamPage,
  head: () => ({
    meta: [
      { title: "Steam Free-to-Play — Portal Gamer" },
      { name: "description", content: "Jogos gratuitos permanentes e promoções imperdíveis da Steam." },
    ],
  }),
});

function SteamPage() {
  const list = getByPlatform("steam");
  return (
    <PageShell>
      <PageHeader
        eyebrow="Steam"
        title="Free-to-Play que valem a pena"
        description="Jogos gratuitos permanentes da Steam que aguentam centenas de horas sem cobrar nada."
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
