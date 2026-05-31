import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/guides")({
  component: AdminGuides,
});

function AdminGuides() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["admin-guides"],
    queryFn: async () => {
      const { data, error } = await supabase.from("guides").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      return data as any[];
    },
  });
  const [form, setForm] = useState({ title: "", description: "", icon: "BookOpen", read_time: "5 min", content: "" });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("guides").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Guia adicionado");
    setForm({ title: "", description: "", icon: "BookOpen", read_time: "5 min", content: "" });
    qc.invalidateQueries({ queryKey: ["admin-guides"] });
    qc.invalidateQueries({ queryKey: ["guides"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir?")) return;
    await supabase.from("guides").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-guides"] });
    qc.invalidateQueries({ queryKey: ["guides"] });
  };

  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl font-bold">Guias</h1>
      <form onSubmit={save} className="grid gap-4 rounded-xl border border-border bg-card p-6 md:grid-cols-2">
        <Field label="Título"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inp} /></Field>
        <Field label="Ícone (Download, Settings, Trophy, BookOpen)"><input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className={inp} /></Field>
        <Field label="Descrição" full><textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inp} rows={2} /></Field>
        <Field label="Tempo de leitura"><input value={form.read_time} onChange={(e) => setForm({ ...form, read_time: e.target.value })} className={inp} /></Field>
        <Field label="Conteúdo (parágrafos separados por linha em branco)" full><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className={inp} rows={8} /></Field>
        <div className="md:col-span-2"><button className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4" /> Adicionar</button></div>
      </form>

      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between p-4">
            <div><p className="font-semibold">{r.title}</p><p className="text-xs text-muted-foreground">{r.description}</p></div>
            <button onClick={() => remove(r.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
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
