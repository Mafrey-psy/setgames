import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell, PageHeader } from "@/components/PageShell";
import { BookOpen, Download, Settings, Trophy, type LucideIcon } from "lucide-react";
import { fetchGuides } from "@/lib/queries";

const faq = [
  { q: "Os jogos grátis são realmente meus?", a: "Sim. Ao resgatar dentro do prazo, o jogo fica permanentemente na sua biblioteca." },
  { q: "Por que não listam free-to-play?", a: "Free-to-play está sempre grátis e não é notícia. Aqui só entram jogos pagos liberados por tempo limitado." },
  { q: "Posso jogar offline?", a: "Depende do launcher — Steam permite modo offline; Epic exige login inicial." },
];

export const Route = createFileRoute("/guias")({
  component: GuiasPage,
  head: () => ({
    meta: [
      { title: "Guias Rápidos — Set Games" },
      { name: "description", content: "Tutoriais curtos para resgatar jogos, configurar launchers e otimizar sua experiência gamer." },
      { property: "og:title", content: "Guias Rápidos — Set Games" },
      { property: "og:description", content: "Tutoriais curtos para resgatar jogos, configurar launchers e otimizar sua experiência gamer." },
      { property: "og:url", content: "https://setgames.lovable.app/guias" },
    ],
    links: [{ rel: "canonical", href: "https://setgames.lovable.app/guias" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
});

const icons: Record<string, LucideIcon> = { Download, Settings, Trophy, BookOpen };

function GuiasPage() {
  const { data: guides = [] } = useQuery({ queryKey: ["guides"], queryFn: fetchGuides });

  return (
    <PageShell>
      <PageHeader eyebrow="Guias" title="Tutoriais sem enrolação" description="O que você precisa saber em menos de 7 minutos." />
      <section className="container mx-auto px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-5 md:grid-cols-2">
          {guides.map((g) => {
            const Icon = icons[g.icon] ?? BookOpen;
            return (
              <article key={g.id} className="group flex gap-4 rounded-xl border border-border bg-card p-6 transition hover:border-accent/50">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold">{g.title}</h3>
                    <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{g.readTime}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{g.description}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-bold">Dúvidas frequentes</h2>
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {faq.map((f) => (
              <details key={f.q} className="group p-5">
                <summary className="cursor-pointer list-none font-semibold marker:hidden">
                  <span className="text-accent">+</span> {f.q}
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
