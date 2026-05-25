import { Link } from "@tanstack/react-router";
import { Calendar, Star } from "lucide-react";
import type { Game } from "@/lib/games";

const fmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });

export function GameCard({ game }: { game: Game }) {
  const expires = new Date(game.freeUntil);
  const showExpiry = expires.getFullYear() < 2099;
  const platformColor = game.platform === "epic" ? "bg-primary/15 text-primary border-primary/30" : "bg-[oklch(0.65_0.18_230_/_0.15)] text-[oklch(0.78_0.18_230)] border-[oklch(0.65_0.18_230_/_0.3)]";

  return (
    <Link
      to="/jogos/$id"
      params={{ id: game.id }}
      className="group relative block overflow-hidden rounded-xl border border-border bg-gradient-to-b from-card to-background transition hover:border-primary/50 hover:shadow-[0_0_30px_oklch(0.72_0.25_305_/_0.25)]"
    >
      <div className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${game.accent}`}>
        {game.imageUrl && (
          <img
            src={game.imageUrl}
            alt={game.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute left-4 top-4 flex gap-2">
          <span className={`rounded border px-2 py-0.5 text-xs font-bold uppercase tracking-wider backdrop-blur ${platformColor}`}>
            {game.platform}
          </span>
        </div>
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded bg-background/70 px-2 py-0.5 text-xs backdrop-blur">
          <Star className="h-3 w-3 fill-accent text-accent" />
          <span className="font-semibold">{game.rating.toFixed(1)}</span>
        </div>
        <h3 className="absolute bottom-3 left-4 right-4 font-display text-xl font-bold leading-tight text-foreground drop-shadow-lg">
          {game.title}
        </h3>
      </div>
      <div className="space-y-3 p-5">
        <p className="line-clamp-3 text-sm text-muted-foreground">{game.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {game.genre.map((g) => (
            <span key={g} className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              {g}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
          <div className="text-muted-foreground">
            <span className="line-through">{game.originalPrice}</span>{" "}
            <span className="font-bold text-accent">GRÁTIS</span>
          </div>
          {showExpiry && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              até {fmt.format(expires)}
            </div>
          )}
        </div>
        <div className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground transition group-hover:bg-primary/90">
          Ver síntese de reviews →
        </div>
      </div>
    </Link>
  );
}
