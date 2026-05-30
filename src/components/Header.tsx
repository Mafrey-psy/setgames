import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Gamepad2, LogOut, Shield, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ContactDialog } from "@/components/ContactDialog";

const nav = [
  { to: "/", label: "Início" },
  { to: "/epic", label: "Epic" },
  { to: "/steam", label: "Steam" },
  { to: "/gog", label: "GOG" },
  { to: "/prime", label: "Prime" },
  { to: "/itch", label: "Itch.io" },
  { to: "/xbox", label: "Xbox" },
  { to: "/discord", label: "Discord" },
  { to: "/guias", label: "Guias" },
  { to: "/cultura", label: "Cultura" },
  { to: "/sobre", label: "Sobre" },
] as const;

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const close = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2" onClick={close}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/15 text-primary transition group-hover:bg-primary/25">
            <Gamepad2 className="h-5 w-5" />
          </span>
          <span className="whitespace-nowrap font-display text-lg font-bold tracking-tight">
            Set Games
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
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
          <ContactDialog
            trigger={
              <button
                type="button"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                Fale conosco
              </button>
            }
          />
        </nav>

        {/* Desktop right actions */}
        <div className="hidden items-center gap-2 lg:flex">
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent/20"
            >
              <Shield className="h-3.5 w-3.5" /> Admin
            </Link>
          )}
          {user && (
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground"
              title={user.email ?? undefined}
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground transition hover:bg-secondary lg:hidden"
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-border/60 bg-background/95 backdrop-blur-xl lg:hidden">
          <nav className="container mx-auto flex flex-col gap-1 px-4 py-4 sm:px-6">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={close}
                className="rounded-md px-3 py-2.5 text-base font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
            <ContactDialog
              trigger={
                <button
                  type="button"
                  className="rounded-md px-3 py-2.5 text-left text-base font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                >
                  Fale conosco
                </button>
              }
            />
            {(isAdmin || user) && (
              <div className="mt-2 flex flex-wrap gap-2 border-t border-border/60 pt-3">
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={close}
                    className="flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent transition hover:bg-accent/20"
                  >
                    <Shield className="h-3.5 w-3.5" /> Admin
                  </Link>
                )}
                {user && (
                  <button
                    onClick={() => {
                      signOut();
                      close();
                    }}
                    className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4" /> Sair
                  </button>
                )}
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
