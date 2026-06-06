import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell, PageHeader } from "@/components/PageShell";
import { BookOpen, Download, Settings, Trophy, type LucideIcon } from "lucide-react";
import { fetchGuides, fetchFaqs } from "@/lib/queries";

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
  }),
});

const icons: Record<string, LucideIcon> = { Download, Settings, Trophy, BookOpen };

function GuiasPage() {
  const { data: guides = [] } = useQuery({ queryKey: ["guides"], queryFn: fetchGuides });
  const { data: faqs = [] } = useQuery({ queryKey: ["faqs"], queryFn: fetchFaqs });

  return (
    <PageShell>
      <PageHeader eyebrow="Guias" title="Tutoriais sem enrolação" description="O que você precisa saber em menos de 7 minutos." />
      <section className="container mx-auto px-4 py-10 sm:px-6 sm:py-12">
        <h2 className="mb-6 font-display text-2xl font-bold">Todos os guias</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {guides.map((g) => {
            const Icon = icons[g.icon] ?? BookOpen;
            return (
              <Link
                key={g.id}
                to="/guias/$id"
                params={{ id: g.id }}
                className="group flex gap-4 rounded-xl border border-border bg-card p-6 transition hover:border-accent/50 hover:shadow-[0_0_30px_oklch(0.78_0.21_145_/_0.15)]"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-bold transition group-hover:text-accent">{g.title}</h3>
                    <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{g.readTime}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{g.description}</p>
                  <span className="mt-3 inline-block text-xs font-semibold text-accent">Ler guia →</span>
                </div>
              </Link>
            );
          })}
        </div>

        {faqs.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 font-display text-2xl font-bold">Dúvidas frequentes</h2>
            <div className="divide-y divide-border rounded-xl border border-border bg-card">
              {faqs.map((f) => (
                <details key={f.id} className="group p-5">
                  <summary className="cursor-pointer list-none font-semibold marker:hidden">
                    <span className="text-accent">+</span> {f.question}
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
}
