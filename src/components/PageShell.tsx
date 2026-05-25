import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="border-b border-border/60 bg-card/30">
      <div className="container mx-auto px-6 py-14">
        {eyebrow && (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
        )}
        <h1 className="font-display text-4xl font-bold md:text-5xl">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>
        )}
      </div>
    </section>
  );
}
