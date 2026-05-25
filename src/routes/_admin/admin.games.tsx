import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/games")({
  component: AdminGames,
});

interface Row {
  id: string;
  title: string;
  description: string;
  platform: string;
  genre: string[];
  original_price: string;
  free_until: string;
  developer: string;
  rating: number;
  url: string;
  accent: string;
  published: boolean;
}

const empty: Omit<Row, "id"> = {
  title: "", description: "", platform: "epic", genre: [], original_price: "",
  free_until: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  developer: "", rating: 4.5, url: "", accent: "from-fuchsia-600 to-rose-500", published: true,
};

function AdminGames() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["admin-games"],
    queryFn: async () => {
      const { data, error } = await supabase.from("games").select("*").order("free_until", { ascending: true });
      if (error) throw error;
      return data as Row[];
    },
  });
  const [form, setForm] = useState({ ...empty, genreText: "" });
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const payload = {
      title: form.title,
      description: form.description,
      platform: form.platform,
      genre: form.genreText.split(",").map((s) => s.trim()).filter(Boolean),
      original_price: form.original_price,
      free_until: new Date(form.free_until).toISOString(),
      developer: form.developer,
      rating: form.rating,
      url: form.url,
      accent: form.accent,
      published: form.published,
    };
    const { error } = await supabase.from("games").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Jogo adicionado");
    setForm({ ...empty, genreText: "" });
    qc.invalidateQueries({ queryKey: ["admin-games"] });
    qc.invalidateQueries({ queryKey: ["games"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este jogo?")) return;
    const { error } = await supabase.from("games").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-games"] });
    qc.invalidateQueries({ queryKey: ["games"] });
  };

  const togglePublished = async (id: string, value: boolean) => {
    const { error } = await supabase.from("games").update({ published: value }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-games"] });
    qc.invalidateQueries({ queryKey: ["games"] });
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold">Jogos</h1>
        <p className="mt-1 text-sm text-muted-foreground">Adicione apenas jogos pagos liberados por tempo limitado.</p>
      </div>

      <form onSubmit={save} className="grid gap-4 rounded-xl border border-border bg-card p-6 md:grid-cols-2">
        <Field label="Título"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inp} /></Field>
        <Field label="Desenvolvedor"><input required value={form.developer} onChange={(e) => setForm({ ...form, developer: e.target.value })} className={inp} /></Field>
        <Field label="Descrição" full><textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inp} rows={2} /></Field>
        <Field label="Plataforma">
          <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className={inp}>
            <option value="epic">Epic</option><option value="steam">Steam</option>
            <option value="gog">GOG</option><option value="playstation">PlayStation</option><option value="xbox">Xbox</option>
          </select>
        </Field>
        <Field label="Gêneros (separados por vírgula)"><input value={form.genreText} onChange={(e) => setForm({ ...form, genreText: e.target.value })} className={inp} placeholder="Ação, RPG" /></Field>
        <Field label="Preço original"><input required value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} className={inp} placeholder="R$ 199,90" /></Field>
        <Field label="Grátis até"><input type="date" required value={form.free_until} onChange={(e) => setForm({ ...form, free_until: e.target.value })} className={inp} /></Field>
        <Field label="Nota (0-5)"><input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className={inp} /></Field>
        <Field label="URL"><input type="url" required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className={inp} /></Field>
        <Field label="Gradiente Tailwind"><input value={form.accent} onChange={(e) => setForm({ ...form, accent: e.target.value })} className={inp} /></Field>
        <div className="md:col-span-2">
          <button disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            <Plus className="h-4 w-4" /> {busy ? "Salvando..." : "Adicionar jogo"}
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3 text-left">Título</th><th className="p-3 text-left">Plataforma</th><th className="p-3 text-left">Grátis até</th><th className="p-3 text-left">Publicado</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3 font-medium">{r.title}</td>
                <td className="p-3 uppercase text-xs text-muted-foreground">{r.platform}</td>
                <td className="p-3 text-muted-foreground">{new Date(r.free_until).toLocaleDateString("pt-BR")}</td>
                <td className="p-3"><input type="checkbox" checked={r.published} onChange={(e) => togglePublished(r.id, e.target.checked)} /></td>
                <td className="p-3 text-right"><button onClick={() => remove(r.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inp = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <label className={full ? "md:col-span-2" : ""}><span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>{children}</label>;
}
