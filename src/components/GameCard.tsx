import { useNavigate } from "@tanstack/react-router";
import { Calendar, ExternalLink, Star } from "lucide-react";
import type { Game } from "@/lib/games";
import { PLATFORM_LABELS } from "@/lib/games";

const fmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });

const PLATFORM_BADGE: Record<string, string> = {
  epic: "bg-primary/15 text-primary border-primary/30",
  steam: "bg-[oklch(0.65_0.18_230_/_0.15)] text-[oklch(0.78_0.18_230)] border-[oklch(0.65_0.18_230_/_0.3)]",
  gog: "bg-[oklch(0.55_0.22_300_/_0.15)] text-[oklch(0.78_0.18_300)] border-[oklch(0.55_0.22_300_/_0.3)]",
  amazon: "bg-[oklch(0.7_0.18_70_/_0.15)] text-[oklch(0.82_0.16_70)] border-[oklch(0.7_0.18_70_/_0.3)]",
  itch: "bg-[oklch(0.65_0.22_25_/_0.15)] text-[oklch(0.78_0.2_25)] border-[oklch(0.65_0.22_25_/_0.3)]",
  xbox: "bg-[oklch(0.65_0.18_150_/_0.15)] text-[oklch(0.78_0.18_150)] border-[oklch(0.65_0.18_150_/_0.3)]",
  discord: "bg-[oklch(0.6_0.18_265_/_0.15)] text-[oklch(0.78_0.16_265)] border-[oklch(0.6_0.18_265_/_0.3)]",
};

export function GameCard({ game }: { game: Game }) {
  const navigate = useNavigate();
  const expires = new Date(game.freeUntil);
  const showExpiry = expires.getFullYear() < 2099;
  const platformColor = PLATFORM_BADGE[game.platform] ?? "bg-secondary text-secondary-foreground border-border";
  const platformLabel = PLATFORM_LABELS[game.platform as keyof typeof PLATFORM_LABELS] ?? game.platform;

  const openReviews = () => navigate({ to: "/jogos/$id", params: { id: game.id } });

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={openReviews}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openReviews(); } }}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-gradient-to-b from-card to-background transition hover:border-primary/50 hover:shadow-[0_0_30px_oklch(0.72_0.25_305_/_0.25)] focus:outline-none focus:ring-2 focus:ring-primary"
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
        <div className="absolute left-3 top-3 flex gap-2 sm:left-4 sm:top-4">
          <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur sm:px-2 sm:text-xs ${platformColor}`}>
            {platformLabel}
          </span>
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded bg-background/70 px-1.5 py-0.5 text-[10px] backdrop-blur sm:right-4 sm:top-4 sm:px-2 sm:text-xs">
          <Star className="h-3 w-3 fill-accent text-accent" />
          <span className="font-semibold">{game.rating.toFixed(1)}</span>
        </div>
        <h3 className="absolute bottom-3 left-3 right-3 line-clamp-2 font-display text-base font-bold leading-tight text-foreground drop-shadow-lg sm:left-4 sm:right-4 sm:text-lg md:text-xl">
          {game.title}
        </h3>
      </div>
      <div className="space-y-3 p-4 sm:p-5">
        <p className="line-clamp-3 text-sm text-muted-foreground">{game.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {game.genre.slice(0, 3).map((g) => (
            <span key={g} className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              {g}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs">
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
        <a
          href={game.url}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Resgatar na plataforma <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </article>
  );
}
