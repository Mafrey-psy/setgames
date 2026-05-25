import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { triggerSync, listSyncLogs } from "@/lib/sync.functions";
import { toast } from "sonner";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/sync")({
  component: AdminSync,
});

function AdminSync() {
  const qc = useQueryClient();
  const fetchLogs = useServerFn(listSyncLogs);
  const runNow = useServerFn(triggerSync);
  const [busy, setBusy] = useState(false);

  const { data: logs = [] } = useQuery({
    queryKey: ["sync-logs"],
    queryFn: () => fetchLogs(),
  });

  const onSync = async () => {
    setBusy(true);
    try {
      const r = await runNow();
      toast.success(`Sincronizado: ${r.inserted} novos, ${r.updated} atualizados`);
      qc.invalidateQueries({ queryKey: ["sync-logs"] });
      qc.invalidateQueries({ queryKey: ["admin-games"] });
      qc.invalidateQueries({ queryKey: ["games"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Falha na sincronização");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Sincronização automática</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Busca jogos pagos liberados gratuitamente na Epic e Steam. Roda toda sexta às 13h.
          </p>
        </div>
        <button
          onClick={onSync}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
          {busy ? "Sincronizando..." : "Sincronizar agora"}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Quando</th>
              <th className="p-3 text-left">Origem</th>
              <th className="p-3 text-left">Resultado</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Nenhuma execução ainda.</td></tr>
            )}
            {logs.map((l: any) => (
              <tr key={l.id} className="border-t border-border align-top">
                <td className="p-3 text-muted-foreground">{new Date(l.created_at).toLocaleString("pt-BR")}</td>
                <td className="p-3 uppercase text-xs">{l.source}</td>
                <td className="p-3">
                  <span className="text-emerald-500">+{l.inserted_count}</span>{" "}
                  <span className="text-muted-foreground">novos</span>,{" "}
                  <span className="text-sky-500">{l.updated_count}</span>{" "}
                  <span className="text-muted-foreground">atualizados</span>
                  {l.error_count > 0 && (
                    <>, <span className="text-destructive">{l.error_count}</span> <span className="text-muted-foreground">erros</span></>
                  )}
                </td>
                <td className="p-3">
                  {l.error_count > 0
                    ? <AlertCircle className="h-4 w-4 text-destructive" />
                    : <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
