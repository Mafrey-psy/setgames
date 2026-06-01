import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Calendar, ExternalLink, Sparkles, Star } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { fetchGame } from "@/lib/queries";
import { getGameReviewsSummary } from "@/lib/reviews.functions";

const gameQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["game", id],
    queryFn: async () => {
      const g = await fetchGame(id);
      if (!g) throw notFound();
      return g;
    },
  });

export const Route = createFileRoute("/jogos/$id")({
  component: GamePage,
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(gameQueryOptions(params.id)),
  head: ({ loaderData }) => {
    const title = loaderData?.title ?? "Jogo grátis por tempo limitado";
    const description = (loaderData?.description ?? "Síntese de reviews dos players e detalhes do resgate gratuito.").slice(0, 160);
    const url = `https://setgames.lovable.app/jogos/${loaderData?.id ?? ""}`;
    return {
      meta: [
        { title: `${title} — Grátis no ${loaderData?.platform ?? "Set Games"}` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: url },
        ...(loaderData?.imageUrl ? [
          { property: "og:image", content: loaderData.imageUrl },
          { name: "twitter:image", content: loaderData.imageUrl },
        ] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: loaderData ? [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: loaderData.title,
            description,
            image: loaderData.imageUrl || undefined,
            brand: loaderData.developer ? { "@type": "Brand", name: loaderData.developer } : undefined,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "BRL",
              availability: "https://schema.org/InStock",
              url: loaderData.url,
            },
          }),
        },
      ] : [],
    };
  },
});

const fmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long" });

function GamePage() {
  const { id } = Route.useParams();
  const { data: game } = useSuspenseQuery(gameQueryOptions(id));
  const getSummary = useServerFn(getGameReviewsSummary);
  const { data: summaryData, isLoading, error } = useQuery({
    queryKey: ["game-reviews", id],
    queryFn: () => getSummary({ data: { id } }),
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  const expires = new Date(game.freeUntil);
  const showExpiry = expires.getFullYear() < 2099;

  return (
    <PageShell>
      <article className="container mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <Link to="/" className="mb-6 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Voltar
        </Link>

        <div className={`relative mb-8 aspect-[16/8] overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${game.accent}`}>
          {game.imageUrl && (
            <img src={game.imageUrl} alt={game.title} className="absolute inset-0 h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-5 left-6 right-6">
            <div className="mb-2 flex items-center gap-2 text-xs">
              <span className="rounded border border-primary/30 bg-primary/15 px-2 py-0.5 font-bold uppercase tracking-wider text-primary backdrop-blur">
                {game.platform}
              </span>
              <span className="flex items-center gap-1 rounded bg-background/70 px-2 py-0.5 backdrop-blur">
                <Star className="h-3 w-3 fill-accent text-accent" /> {game.rating.toFixed(1)}
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold leading-tight drop-shadow-lg sm:text-3xl md:text-5xl">{game.title}</h1>
            {game.developer && <p className="mt-1 text-sm text-muted-foreground">{game.developer}</p>}
          </div>
        </div>

        <p className="text-base leading-relaxed text-foreground/90">{game.description}</p>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
          {game.genre.map((g) => (
            <span key={g} className="rounded-md bg-secondary px-2 py-0.5 text-secondary-foreground">{g}</span>
          ))}
          <div className="ml-auto flex items-center gap-3 text-muted-foreground">
            <span><span className="line-through">{game.originalPrice}</span> <span className="font-bold text-accent">GRÁTIS</span></span>
            {showExpiry && (
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> até {fmt.format(expires)}</span>
            )}
          </div>
        </div>

        <a
          href={game.url}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Resgatar agora <ExternalLink className="h-3.5 w-3.5" />
        </a>

        <section className="mt-12 rounded-2xl border border-border bg-card/40 p-4 sm:p-6 md:p-8">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h2 className="font-display text-2xl font-bold">Síntese das reviews dos players</h2>
          </div>
          {isLoading && (
            <div className="space-y-3">
              <div className="h-3 w-3/4 animate-pulse rounded bg-secondary" />
              <div className="h-3 w-full animate-pulse rounded bg-secondary" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-secondary" />
              <p className="pt-2 text-xs text-muted-foreground">Compilando opiniões dos jogadores…</p>
            </div>
          )}
          {error && (
            <p className="text-sm text-destructive">Não foi possível gerar a síntese agora. Tente novamente em instantes.</p>
          )}
          {summaryData && !summaryData.summary && (
            <p className="text-sm text-muted-foreground">A síntese deste jogo ainda não foi gerada. Volte em breve.</p>
          )}
          {summaryData?.summary && (
            <div className="prose-summary space-y-3 text-sm leading-relaxed text-foreground/90">
              {summaryData.summary.split("\n").filter(Boolean).map((line, i) => {
                const m = line.match(/^\s*\*\*(.+?)\*\*\s*[:—-]?\s*(.*)$/);
                if (m && !line.trim().startsWith("-") && !line.trim().startsWith("*")) {
                  return (
                    <div key={i}>
                      <h3 className="mt-4 font-display text-base font-bold text-foreground">{m[1]}</h3>
                      {m[2] && <p className="mt-1">{m[2]}</p>}
                    </div>
                  );
                }
                if (/^\s*[-*]\s+/.test(line)) {
                  return <li key={i} className="ml-5 list-disc">{line.replace(/^\s*[-*]\s+/, "")}</li>;
                }
                return <p key={i}>{line}</p>;
              })}
            </div>
          )}
        </section>
      </article>
    </PageShell>
  );
}
