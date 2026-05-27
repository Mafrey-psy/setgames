import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const getGameReviewsSummary = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => {
    if (!d?.id || typeof d.id !== "string" || !UUID_RE.test(d.id)) {
      throw new Error("id inválido");
    }
    return d;
  })
  .handler(async ({ data }) => {
    const { data: game, error } = await supabaseAdmin
      .from("games")
      .select("id,title,developer,platform,genre,reviews_summary,reviews_summary_updated_at")
      .eq("id", data.id)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!game) throw new Error("Jogo não encontrado");

    const cachedAt = game.reviews_summary_updated_at ? new Date(game.reviews_summary_updated_at).getTime() : 0;
    const fresh = Date.now() - cachedAt < 1000 * 60 * 60 * 24 * 30;
    if (game.reviews_summary && fresh) {
      return { summary: game.reviews_summary as string, cached: true };
    }

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY ausente");

    const prompt = `Você é um curador gamer. Resuma em português brasileiro a recepção dos jogadores ao jogo "${game.title}" (desenvolvedora: ${game.developer ?? "?"}, plataforma: ${game.platform}). 
Estruture em 4 seções curtas com títulos em **negrito** markdown:
1. **Visão geral** — 1 parágrafo (3-4 frases) sobre o tom geral das reviews.
2. **O que jogadores elogiam** — 3 a 5 bullets.
3. **Críticas recorrentes** — 2 a 4 bullets.
4. **Para quem é** — 1 frase de recomendação.
Seja honesto, conciso e baseado no consenso público das reviews. Não invente notas numéricas específicas.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`AI gateway: ${resp.status} ${txt.slice(0, 200)}`);
    }
    const json: any = await resp.json();
    const summary: string = json?.choices?.[0]?.message?.content ?? "";
    if (!summary) throw new Error("Resposta vazia do modelo");

    await supabaseAdmin
      .from("games")
      .update({ reviews_summary: summary, reviews_summary_updated_at: new Date().toISOString() })
      .eq("id", game.id);

    return { summary, cached: false };
  });
