import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { fetchCulturePost } from "@/lib/queries";
import { Calendar, ArrowLeft } from "lucide-react";

const postQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["culture", slug],
    queryFn: async () => {
      const post = await fetchCulturePost(slug);
      if (!post) throw notFound();
      return post;
    },
  });

export const Route = createFileRoute("/cultura/$slug")({
  component: PostPage,
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(postQueryOptions(params.slug)),
  head: ({ params, loaderData }) => {
    const title = loaderData?.title ?? params.slug;
    const description = (loaderData?.excerpt ?? "Artigo de cultura gamer no Portal Gamer.").slice(0, 160);
    const url = `https://setgames.lovable.app/cultura/${params.slug}`;
    return {
      meta: [
        { title: `${title} — Cultura Gamer` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...(loaderData
          ? [
              { property: "article:published_time", content: new Date(loaderData.publishedAt).toISOString() },
              { property: "article:author", content: loaderData.author },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: loaderData
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                headline: loaderData.title,
                description: loaderData.excerpt,
                datePublished: new Date(loaderData.publishedAt).toISOString(),
                author: { "@type": "Person", name: loaderData.author },
                mainEntityOfPage: url,
              }),
            },
          ]
        : [],
    };
  },
});

const fmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

function PostPage() {
  const { slug } = Route.useParams();
  const { data: post } = useSuspenseQuery(postQueryOptions(slug));

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
