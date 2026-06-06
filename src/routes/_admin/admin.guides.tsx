import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/guides")({
  component: AdminGuides,
});

interface Row {
  id: string;
  title: string;
  description: string;
  icon: string;
  read_time: string;
  content: string;
  published: boolean;
}

const empty = { title: "", description: "", icon: "BookOpen", read_time: "5 min", content: "", published: true };

function AdminGuides() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["admin-guides"],
    queryFn: async () => {
      const { data, error } = await supabase.from("guides").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      return data as Row[];
    },
  });
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-guides"] });
    qc.invalidateQueries({ queryKey: ["guides"] });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = editingId
      ? await supabase.from("guides").update(form).eq("id", editingId)
      : await supabase.from("guides").insert(form);
    if (error) return toast.error(error.message);
    toast.success(editingId ? "Guia atualizado" : "Guia adicionado");
    setForm(empty);
    setEditingId(null);
    invalidate();
  };

  const startEdit = (r: Row) => {
    setEditingId(r.id);
    setForm({
      title: r.title, description: r.description, icon: r.icon,
      read_time: r.read_time, content: r.content ?? "", published: r.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => { setEditingId(null); setForm(empty); };

  const remove = async (id: string) => {
    if (!confirm("Excluir?")) return;
    await supabase.from("guides").delete().eq("id", id);
    invalidate();
  };

  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl font-bold">Guias</h1>
      <form onSubmit={save} className="grid gap-4 rounded-xl border border-border bg-card p-6 md:grid-cols-2">
        <div className="md:col-span-2 flex items-center justify-between">
          <p className="text-sm font-semibold">{editingId ? "Editando guia" : "Novo guia"}</p>
          {editingId && <button type="button" onClick={cancelEdit} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /> Cancelar</button>}
        </div>
        <Field label="Título"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inp} /></Field>
        <Field label="Ícone (Download, Settings, Trophy, BookOpen)"><input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className={inp} /></Field>
        <Field label="Descrição" full><textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inp} rows={2} /></Field>
        <Field label="Tempo de leitura"><input value={form.read_time} onChange={(e) => setForm({ ...form, read_time: e.target.value })} className={inp} /></Field>
        <label className="flex items-end gap-2 pb-2 text-sm"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Publicado</label>
        <Field label="Conteúdo (parágrafos separados por linha em branco)" full><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className={inp} rows={10} /></Field>
        <div className="md:col-span-2"><button className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4" /> {editingId ? "Salvar alterações" : "Adicionar"}</button></div>
      </form>

      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {rows.map((r) => (
          <li key={r.id} className="flex items-start justify-between gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{r.title}</p>
              <p className="text-xs text-muted-foreground">{r.description}</p>
              {!r.published && <p className="mt-1 text-xs text-muted-foreground">Rascunho</p>}
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
function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <label className={full ? "md:col-span-2" : ""}><span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>{children}</label>;
}
