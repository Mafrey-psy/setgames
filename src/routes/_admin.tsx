import { createFileRoute, Outlet, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { useEffect } from "react";
import { LayoutDashboard, Gamepad2, BookOpen, Newspaper, Mail, RefreshCw, MessageCircle, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/admin-guard.functions";

export const Route = createFileRoute("/_admin")({
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/login" });
    }
    try {
      const res = await checkIsAdmin();
      if (!res.isAdmin) {
        throw redirect({ to: "/" });
      }
    } catch (e) {
      if ((e as any)?.isRedirect) throw e;
      throw redirect({ to: "/" });
    }
  },
  component: AdminLayout,
});


const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/sync", label: "Sincronização", icon: RefreshCw, exact: false },
  { to: "/admin/games", label: "Jogos", icon: Gamepad2, exact: false },
  { to: "/admin/guides", label: "Guias", icon: BookOpen, exact: false },
  { to: "/admin/culture", label: "Cultura", icon: Newspaper, exact: false },
  { to: "/admin/subscribers", label: "Newsletter", icon: Mail, exact: false },
  { to: "/admin/tickets", label: "Fale conosco", icon: MessageCircle, exact: false },
] as const;

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else if (!isAdmin) navigate({ to: "/" });
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user || !isAdmin) {
    return (
      <PageShell>
        <div className="container mx-auto px-6 py-16 text-muted-foreground">Verificando acesso…</div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="container mx-auto grid gap-8 px-6 py-10 md:grid-cols-[200px_1fr]">
        <aside>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">Admin</p>
          <nav className="flex flex-col gap-1">
            {items.map((i) => (
              <Link
                key={i.to}
                to={i.to}
                activeOptions={{ exact: i.exact }}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
              >
                <i.icon className="h-4 w-4" /> {i.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div><Outlet /></div>
      </div>
    </PageShell>
  );
}
