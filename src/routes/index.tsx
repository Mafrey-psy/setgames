import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronUp, Sparkles } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { GameCard } from "@/components/GameCard";
import { NewsletterForm } from "@/components/NewsletterForm";
import { fetchGames } from "@/lib/queries";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Set Games — Jogos grátis por tempo limitado" },
      { name: "description", content: "Curadoria diária dos melhores jogos grátis por tempo limitado na Epic e Steam. Sem free-to-play, sem ruído." },
      { property: "og:title", content: "Set Games — Jogos grátis por tempo limitado" },
      { property: "og:description", content: "Curadoria diária dos melhores jogos grátis por tempo limitado na Epic e Steam." },
      { property: "og:url", content: "https://setgames.lovable.app/" },
    ],
    links: [
      { rel: "canonical", href: "https://setgames.lovable.app/" },
      { rel: "preload", as: "image", href: heroImg, fetchpriority: "high" },
    ],
  }),
});

function HomePage() {
  const { data: games = [] } = useQuery({ queryKey: ["games"], queryFn: () => fetchGames() });
  const featured = games.slice(0, 3);
  const [showAll, setShowAll] = useState(false);
  const displayedGames = showAll ? games : featured;

  return (
    <PageShell>
      <section className="relative overflow-hidden border-b border-border/60">
        <img src={heroImg} alt="" width={1920} height={1080} fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="container relative mx-auto px-4 py-14 sm:px-6 sm:py-20 md:py-28 lg:py-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent sm:text-xs">
            <Sparkles className="h-3 w-3" /> Atualizado diariamente
          </span>
          <h1 className="mt-5 max-w-3xl font-display text-[2rem] font-bold leading-[1.1] sm:mt-6 sm:text-5xl md:text-6xl lg:text-7xl">
            Seus jogos favoritos.<br />
            <span className="text-gradient">De graça. De verdade.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:mt-5 sm:text-base lg:text-lg">
            Só jogos pagos liberados por tempo limitado — nada de free-to-play disfarçado. Curadoria humana, sem clickbait.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to="/epic" className="flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 glow-purple">
              Ver jogos Epic <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/steam" className="flex items-center justify-center rounded-md border border-border bg-card/50 px-5 py-3 text-sm font-semibold transition hover:bg-secondary">
              Promoções Steam
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Em destaque</p>
            <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Resgate antes que acabe</h2>
          </div>
          {games.length > 3 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              {showAll ? (
                <>
                  Mostrar menos <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>Ver todos →</>
              )}
            </button>
          )}
        </div>

        {displayedGames.length === 0 ? (
          <p className="text-muted-foreground">Nenhum jogo grátis no momento. Volte amanhã!</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {displayedGames.map((g) => <GameCard key={g.id} game={g} />)}
          </div>
        )}
      </section>

      <section id="newsletter" className="border-t border-border/60 bg-card/30">
        <div className="container mx-auto max-w-2xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Receba a curadoria diária</h2>
          <p className="mt-2 text-muted-foreground">
            Todos os dias: jogos grátis novos, sem spam, sem patrocínio.
          </p>
          <div className="mt-6">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
