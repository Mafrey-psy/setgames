import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/PageShell";
import { Brain, Heart, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/sobre")({
  component: SobrePage,
  head: () => ({
    meta: [
      { title: "Sobre — Set Games" },
      { name: "description", content: "Projeto independente que une curadoria gamer e análise comportamental, mantido por um psicólogo gamer." },
      { property: "og:title", content: "Sobre — Set Games" },
      { property: "og:description", content: "Projeto independente que une curadoria gamer e análise comportamental." },
      { property: "og:url", content: "https://setgames.lovable.app/sobre" },
    ],
    links: [{ rel: "canonical", href: "https://setgames.lovable.app/sobre" }],
  }),
});

function SobrePage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Sobre" title="Curadoria com cabeça de psicólogo." />
      <section className="container mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">

          O <span className="text-foreground font-semibold">Set Games</span> nasceu da combinação entre paixão por jogos e
          formação em Análise do Comportamento. Selecionamos drops gratuitos da Epic e Steam com um filtro além do hype:
          {" "}<span className="text-foreground">vale o tempo que você vai investir?</span>
        </p>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Sem publi disfarçada, sem afiliado escondido, sem clickbait. Todos os dias, 13h, lista pronta no seu e-mail.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {[
            { icon: Brain, title: "Curadoria analítica", text: "Critério editorial baseado em reforço e engajamento sustentável." },
            { icon: ShieldCheck, title: "Independente", text: "Sem patrocínio das publishers — opinião sempre honesta." },
            { icon: Heart, title: "Comunidade", text: "Construído por quem joga, para quem joga." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-lg border border-border bg-card p-5">
              <Icon className="mb-3 h-6 w-6 text-primary" />
              <div className="font-semibold">{title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
