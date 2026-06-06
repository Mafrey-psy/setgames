import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/culture")({
  component: AdminCulture,
});

interface Row {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  published: boolean;
}

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

const empty = { title: "", slug: "", excerpt: "", content: "", author: "Set Games", published: true };

function AdminCulture() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["admin-culture"],
    queryFn: async () => {
      const { data, error } = await supabase.from("culture_posts").select("*").order("published_at", { ascending: false });
      if (error) throw error;
      return data as Row[];
    },
  });
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-culture"] });
    qc.invalidateQueries({ queryKey: ["culture"] });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = form.slug || slugify(form.title);
    const payload = { ...form, slug };
    const { error } = editingId
      ? await supabase.from("culture_posts").update(payload).eq("id", editingId)
      : await supabase.from("culture_posts").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editingId ? "Artigo atualizado" : "Artigo publicado");
    setForm(empty);
    setEditingId(null);
    invalidate();
  };

  const startEdit = (r: Row) => {
    setEditingId(r.id);
    setForm({
      title: r.title, slug: r.slug, excerpt: r.excerpt,
      content: r.content, author: r.author, published: r.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => { setEditingId(null); setForm(empty); };

  const remove = async (id: string) => {
    if (!confirm("Excluir?")) return;
    await supabase.from("culture_posts").delete().eq("id", id);
    invalidate();
  };

  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl font-bold">Cultura Gamer</h1>
      <form onSubmit={save} className="grid gap-4 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">{editingId ? "Editando artigo" : "Novo artigo"}</p>
          {editingId && <button type="button" onClick={cancelEdit} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /> Cancelar</button>}
        </div>
        <Field label="Título"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inp} /></Field>
        <Field label="Slug (opcional)"><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-gerado" className={inp} /></Field>
        <Field label="Resumo"><textarea required value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} className={inp} /></Field>
        <Field label="Conteúdo (use linhas em branco entre parágrafos)"><textarea required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={12} className={inp} /></Field>
        <Field label="Autor"><input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className={inp} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Publicado</label>
        <div><button className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4" /> {editingId ? "Salvar alterações" : "Publicar"}</button></div>
      </form>

      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {rows.map((r) => (
          <li key={r.id} className="flex items-start justify-between gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{r.title}</p>
              <p className="text-xs text-muted-foreground">/{r.slug}{!r.published && " · rascunho"}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(r)} className="text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => remove(r.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const inp = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>{children}</label>;
}
