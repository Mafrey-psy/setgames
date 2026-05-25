import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { GameCard } from "@/components/GameCard";
import { games } from "@/lib/games";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Portal Gamer — Jogos grátis, sem ruído" },
      { name: "description", content: "Curadoria semanal de jogos grátis na Epic Games, Steam e mais. Guias rápidos e cultura gamer." },
    ],
  }),
});

function Index() {
  const featured = games.slice(0, 3);
  return (
    <PageShell>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60">
        <img
          src={heroImg}
          alt=""
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="container relative mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" /> Atualizado toda quinta-feira
            </div>
            <h1 className="font-display text-5xl font-bold leading-[1.05] md:text-7xl">
              Jogos grátis,
              <br />
              <span className="text-gradient">sem ruído.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Curadoria independente das melhores ofertas gratuitas da Epic Games e Steam — com guias rápidos e contexto cultural.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/epic"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 hover:shadow-[0_0_30px_oklch(0.72_0.25_305_/_0.5)]"
              >
                Ver Epic da semana <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/steam"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary/70"
              >
                Free-to-Play Steam
              </Link>
            </div>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Zap, title: "Rápido", text: "Tudo verificado em até 24h após o anúncio." },
              { icon: Shield, title: "Confiável", text: "Apenas lojas oficiais. Zero links suspeitos." },
              { icon: Sparkles, title: "Curado", text: "Selecionamos o que vale o seu HD." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-lg border border-border/60 bg-card/60 p-4 backdrop-blur">
                <Icon className="mb-2 h-5 w-5 text-accent" />
                <div className="font-semibold">{title}</div>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESTAQUES */}
      <section className="container mx-auto px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-primary">Destaques da semana</p>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Para resgatar agora</h2>
          </div>
          <Link to="/epic" className="hidden text-sm text-muted-foreground hover:text-foreground md:inline">
            Ver tudo →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section id="newsletter" className="container mx-auto px-6 pb-20">
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card to-card p-10 md:p-14">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative max-w-xl">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Nunca perca um jogo grátis</h2>
            <p className="mt-2 text-muted-foreground">
              Toda quinta às 13h. Sem spam, sem afiliado disfarçado. Só os drops da semana.
            </p>
            <form className="mt-6 flex flex-col gap-2 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="seu@email.com"
                className="flex-1 rounded-md border border-border bg-background px-4 py-3 text-sm outline-none ring-primary placeholder:text-muted-foreground focus:ring-2"
              />
              <button className="rounded-md bg-accent px-5 py-3 text-sm font-bold text-accent-foreground transition hover:opacity-90">
                Quero receber
              </button>
            </form>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
