import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { fetchGuide } from "@/lib/queries";
import { ArrowLeft, BookOpen, Download, Settings, Trophy, type LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = { Download, Settings, Trophy, BookOpen };

const guideQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["guide", id],
    queryFn: async () => {
      const g = await fetchGuide(id);
      if (!g) throw notFound();
      return g;
    },
  });

export const Route = createFileRoute("/guias/$id")({
  component: GuidePage,
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(guideQueryOptions(params.id)),
  head: ({ params, loaderData }) => {
    const title = loaderData?.title ?? "Guia";
    const description = (loaderData?.description ?? "Guia rápido no Set Games.").slice(0, 160);
    const url = `https://setgames.lovable.app/guias/${params.id}`;
    return {
      meta: [
        { title: `${title} — Guias Set Games` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description,
            url,
            mainEntityOfPage: url,
            author: { "@type": "Organization", name: "Set Games", url: "https://setgames.lovable.app" },
            publisher: {
              "@type": "Organization",
              name: "Set Games",
              logo: { "@type": "ImageObject", url: "https://setgames.lovable.app/favicon.ico" },
            },
            datePublished: loaderData?.createdAt ?? new Date().toISOString(),
            dateModified: loaderData?.createdAt ?? new Date().toISOString(),
            inLanguage: "pt-BR",
            articleBody: loaderData?.content ?? description,
          }),
        },
      ],
    };
  },
});

function GuidePage() {
  const { id } = Route.useParams();
  const { data: guide } = useSuspenseQuery(guideQueryOptions(id));
  const Icon = icons[guide.icon] ?? BookOpen;

  return (
    <PageShell>
      <article className="container mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <Link to="/guias" className="mb-6 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Guias
        </Link>
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent">
            <Icon className="h-6 w-6" />
          </div>
          <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{guide.readTime}</span>
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">{guide.title}</h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">{guide.description}</p>
        {guide.content ? (
          <div className="mt-8 space-y-4 text-base leading-relaxed text-foreground/90">
            {guide.content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-lg border border-dashed border-border bg-card/40 p-6 text-sm text-muted-foreground">
            Conteúdo deste guia ainda não foi publicado.
          </p>
        )}
      </article>
    </PageShell>
  );
}
