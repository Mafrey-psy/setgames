import { Link } from "@tanstack/react-router";
import { Gamepad2 } from "lucide-react";

const nav = [
  { to: "/", label: "Início" },
  { to: "/epic", label: "Epic" },
  { to: "/steam", label: "Steam" },
  { to: "/guias", label: "Guias" },
  { to: "/sobre", label: "Sobre" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="group flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/15 text-primary transition group-hover:bg-primary/25">
            <Gamepad2 className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            portal<span className="text-gradient">.gamer</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <a
          href="#newsletter"
          className="hidden rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 sm:inline-block"
        >
          Assinar
        </a>
      </div>
    </header>
  );
}
