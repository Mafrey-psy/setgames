import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/faq")({
  component: AdminFaq,
});

interface Row {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  published: boolean;
}

const empty = { question: "", answer: "", sort_order: 0, published: true };

function AdminFaq() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("faqs").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Row[];
    },
  });
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-faqs"] });
    qc.invalidateQueries({ queryKey: ["faqs"] });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const { error } = await supabase.from("faqs").update(form).eq("id", editingId);
      if (error) return toast.error(error.message);
      toast.success("Pergunta atualizada");
    } else {
      const { error } = await supabase.from("faqs").insert(form);
      if (error) return toast.error(error.message);
      toast.success("Pergunta adicionada");
    }
    setForm(empty);
    setEditingId(null);
    invalidate();
  };

  const startEdit = (r: Row) => {
    setEditingId(r.id);
    setForm({ question: r.question, answer: r.answer, sort_order: r.sort_order, published: r.published });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => { setEditingId(null); setForm(empty); };

  const remove = async (id: string) => {
    if (!confirm("Excluir?")) return;
    await supabase.from("faqs").delete().eq("id", id);
    invalidate();
  };

  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl font-bold">Dúvidas frequentes</h1>

      <form onSubmit={save} className="grid gap-4 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">{editingId ? "Editando pergunta" : "Nova pergunta"}</p>
          {editingId && <button type="button" onClick={cancelEdit} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /> Cancelar</button>}
        </div>
        <Field label="Pergunta"><input required value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className={inp} /></Field>
        <Field label="Resposta"><textarea required value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={4} className={inp} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Ordem"><input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className={inp} /></Field>
          <label className="flex items-end gap-2 pb-2 text-sm"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Publicado</label>
        </div>
        <div><button className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4" /> {editingId ? "Salvar alterações" : "Adicionar"}</button></div>
      </form>

      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {rows.map((r) => (
          <li key={r.id} className="flex items-start justify-between gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{r.question}</p>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{r.answer}</p>
              <p className="mt-1 text-xs text-muted-foreground">Ordem: {r.sort_order} · {r.published ? "Publicado" : "Rascunho"}</p>
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
