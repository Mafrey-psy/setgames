import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { fetchCulturePost } from "@/lib/queries";
import { Calendar, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/cultura/$slug")({
  component: PostPage,
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Cultura Gamer` },
    ],
  }),
});

const fmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

function PostPage() {
  const { slug } = Route.useParams();
  const { data: post, isLoading } = useQuery({
    queryKey: ["culture", slug],
    queryFn: () => fetchCulturePost(slug),
  });

  if (isLoading) {
    return <PageShell><div className="container mx-auto px-6 py-16 text-muted-foreground">Carregando...</div></PageShell>;
  }
  if (!post) throw notFound();

  return (
    <PageShell>
      <article className="container mx-auto max-w-2xl px-6 py-16">
        <Link to="/cultura" className="mb-6 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Cultura Gamer
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {fmt.format(new Date(post.publishedAt))}
          <span>·</span>
          <span>{post.author}</span>
        </div>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl">{post.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
        <div className="mt-8 space-y-4 text-base leading-relaxed text-foreground/90">
          {post.content.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </article>
    </PageShell>
  );
}
