import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell, PageHeader } from "@/components/PageShell";
import { fetchCulturePosts } from "@/lib/queries";
import { Calendar } from "lucide-react";

export const Route = createFileRoute("/cultura")({
  component: CulturaPage,
  head: () => ({
    meta: [
      { title: "Cultura Gamer — Portal Gamer" },
      { name: "description", content: "Artigos curtos sobre cultura gamer: gêneros, comportamento, indústria e estética." },
    ],
  }),
});

const fmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

function CulturaPage() {
  const { data: posts = [] } = useQuery({ queryKey: ["culture"], queryFn: fetchCulturePosts });

  return (
    <PageShell>
      <PageHeader
        eyebrow="Cultura Gamer"
        title="Leituras curtas, ideias densas"
        description="Editorial sobre o que importa em jogos — sem review de release."
      />
      <section className="container mx-auto px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((p) => (
            <Link
              key={p.id}
              to="/cultura/$slug"
              params={{ slug: p.slug }}
              className="group flex flex-col rounded-xl border border-border bg-card p-6 transition hover:border-primary/50 hover:shadow-[0_0_30px_oklch(0.72_0.25_305_/_0.15)]"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {fmt.format(new Date(p.publishedAt))}
                <span>·</span>
                <span>{p.author}</span>
              </div>
              <h2 className="mt-3 font-display text-2xl font-bold leading-tight transition group-hover:text-primary">
                {p.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
              <span className="mt-4 text-xs font-semibold text-accent">Ler artigo →</span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
