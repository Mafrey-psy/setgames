import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail } from "lucide-react";

const schema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
});

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: parsed.data.email });
    setLoading(false);
    if (error) {
      if (error.code === "23505") toast.error("Este e-mail já está inscrito.");
      else toast.error("Não foi possível inscrever. Tente de novo.");
      return;
    }
    toast.success("Inscrição confirmada! Diariamente na sua caixa.");
    setEmail("");
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          maxLength={255}
          className="w-full rounded-md border border-border bg-background pl-10 pr-3 py-2.5 text-sm outline-none transition focus:border-primary"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "Enviando..." : "Inscrever"}
      </button>
    </form>
  );
}
