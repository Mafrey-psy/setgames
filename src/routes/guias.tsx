import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/PageShell";
import { BookOpen, Download, Settings, Trophy } from "lucide-react";

export const Route = createFileRoute("/guias")({
  component: GuiasPage,
  head: () => ({
    meta: [
      { title: "Guias Rápidos — Portal Gamer" },
      { name: "description", content: "Tutoriais curtos para resgatar jogos, configurar launchers e otimizar sua experiência." },
    ],
  }),
});

const guias = [
  {
    icon: Download,
    title: "Como resgatar jogos da Epic",
    desc: "Passo a passo para não perder o drop semanal — mesmo no celular.",
    time: "3 min",
  },
  {
    icon: Settings,
    title: "Otimizando a Steam no PC fraco",
    desc: "Reduza overhead do launcher e ganhe FPS em jogos antigos.",
    time: "5 min",
  },
  {
    icon: Trophy,
    title: "Conquistas raras: vale a pena?",
    desc: "Análise psicológica de gamificação e quando largar a busca por platinum.",
    time: "7 min",
  },
  {
    icon: BookOpen,
    title: "Glossário do gamer iniciante",
    desc: "FPS, MOBA, gacha, roguelike — decifre os termos sem cringe.",
    time: "4 min",
  },
];

const faq = [
  { q: "Os jogos grátis são realmente meus?", a: "Sim. Ao resgatar dentro do prazo, o jogo fica permanentemente na sua biblioteca." },
  { q: "Preciso pagar algo depois?", a: "Não. Os jogos da Epic ficam na sua conta sem custos recorrentes." },
  { q: "Posso jogar offline?", a: "Depende do launcher — Steam permite modo offline; Epic exige login inicial." },
];

function GuiasPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Guias" title="Tutoriais sem enrolação" description="O que você precisa saber em menos de 7 minutos." />
      <section className="container mx-auto px-6 py-12">
        <div className="grid gap-5 md:grid-cols-2">
          {guias.map(({ icon: Icon, title, desc, time }) => (
            <article key={title} className="group flex gap-4 rounded-xl border border-border bg-card p-6 transition hover:border-accent/50">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-bold">{title}</h3>
                  <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{time}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            </article>
          ))}
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
