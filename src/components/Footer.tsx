export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-card/40">
      <div className="container mx-auto grid gap-8 px-6 py-12 md:grid-cols-3">
        <div>
          <h3 className="font-display text-lg font-bold">
            Set Games
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Curadoria de jogos grátis, guias rápidos e cultura gamer — sem ruído.
          </p>
        </div>
        <div className="text-sm">
          <h4 className="mb-3 font-semibold">Seções</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li>Epic Games Grátis</li>
            <li>Steam Free-to-Play</li>
            <li>Guias Rápidos</li>
            <li>Cultura Gamer</li>
          </ul>
        </div>
        <div className="text-sm">
          <h4 className="mb-3 font-semibold">Sobre</h4>
          <p className="text-muted-foreground">
            Projeto independente. Conteúdo verificado diariamente. Sem patrocínio das publishers.
          </p>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Set Games · Feito com ☕ e teclado mecânico.
      </div>
    </footer>
  );
}
