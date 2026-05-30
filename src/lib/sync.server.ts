// Server-only: free games sync logic (Epic + Steam)
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type SupportedPlatform =
  | "epic"
  | "steam"
  | "gog"
  | "amazon"
  | "itch"
  | "xbox"
  | "discord";

interface NormalizedGame {
  source_id: string;
  title: string;
  description: string;
  platform: SupportedPlatform;
  genre: string[];
  original_price: string;
  free_until: string; // ISO
  developer: string;
  rating: number;
  url: string;
  accent: string;
  image_url: string | null;
}

const ACCENTS: Record<SupportedPlatform, string> = {
  epic: "from-fuchsia-600 to-rose-500",
  steam: "from-sky-500 to-indigo-600",
  gog: "from-purple-600 to-violet-700",
  amazon: "from-amber-500 to-orange-600",
  itch: "from-red-500 to-pink-600",
  xbox: "from-emerald-500 to-green-700",
  discord: "from-indigo-500 to-blue-600",
};

const DEVELOPER_LABEL: Record<SupportedPlatform, string> = {
  epic: "Epic Games Store",
  steam: "Steam",
  gog: "GOG",
  amazon: "Prime Gaming",
  itch: "Itch.io",
  xbox: "Xbox",
  discord: "Discord",
};

async function fetchEpic(): Promise<NormalizedGame[]> {
  const res = await fetch(
    "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=pt-BR&country=BR&allowCountries=BR",
    { headers: { "User-Agent": "Mozilla/5.0 PortalGamerBot" } },
  );
  if (!res.ok) throw new Error(`Epic API ${res.status}`);
  const json: any = await res.json();
  const elements: any[] = json?.data?.Catalog?.searchStore?.elements ?? [];
  const now = Date.now();
  const out: NormalizedGame[] = [];

  for (const el of elements) {
    const title: string = el?.title ?? "";
    if (/mystery game/i.test(title)) continue;

    const promos = el?.promotions?.promotionalOffers?.[0]?.promotionalOffers ?? [];
    const active = promos.find((p: any) => {
      const start = new Date(p.startDate).getTime();
      const end = new Date(p.endDate).getTime();
      return start <= now && end >= now && p?.discountSetting?.discountPercentage === 0;
    });
    if (!active) continue;

    // Epic zeroes totalPrice.originalPrice during the free promo, so we cannot
    // use it to filter F2P. The freeGamesPromotions feed only contains paid
    // games on the weekly rotation, so trust the feed + the active promo.
    const tp = el?.price?.totalPrice ?? {};
    const fmtOriginal: string = tp?.fmtPrice?.originalPrice ?? "";
    const displayPrice = fmtOriginal && fmtOriginal !== "0" ? fmtOriginal : "Pago";

    const slug =
      el?.offerMappings?.[0]?.pageSlug ||
      el?.catalogNs?.mappings?.[0]?.pageSlug ||
      el?.productSlug ||
      el?.urlSlug;
    if (!slug) continue;
    const url = `https://store.epicgames.com/pt-BR/p/${String(slug).replace(/\/home$/, "")}`;
    const developer =
      el?.seller?.name ||
      (el?.customAttributes ?? []).find((a: any) => a.key === "developerName")?.value ||
      "Desconhecido";
    const keyImage =
      (el?.keyImages ?? []).find((i: any) =>
        ["OfferImageWide", "DieselStoreFrontWide", "VaultClosed", "Thumbnail"].includes(i.type),
      ) || (el?.keyImages ?? [])[0];
    const imageUrl: string | null = keyImage?.url ?? null;

    out.push({
      source_id: `epic:${el.id}`,
      title: el.title,
      description: (el.description || "").slice(0, 500),
      platform: "epic",
      genre: (el.tags ?? []).map((t: any) => t.name).filter(Boolean).slice(0, 4),
      original_price: displayPrice,
      free_until: new Date(active.endDate).toISOString(),
      developer,
      rating: 4.5,
      url,
      accent: ACCENTS.epic,
      image_url: imageUrl,
    });
  }
  return out;
}

async function fetchSteam(): Promise<NormalizedGame[]> {
  // Steam featured specials (only paid games with 100% discount = temporary free)
  const res = await fetch("https://store.steampowered.com/api/featuredcategories?cc=br&l=portuguese", {
    headers: { "User-Agent": "Mozilla/5.0 PortalGamerBot" },
  });
  if (!res.ok) throw new Error(`Steam API ${res.status}`);
  const json: any = await res.json();
  const specials: any[] = json?.specials?.items ?? [];
  const out: NormalizedGame[] = [];

  for (const it of specials) {
    if (it.discount_percent !== 100) continue;
    if (!it.original_price || it.original_price <= 0) continue;
    // Filter DLC
    if (it.type && it.type !== 0) continue;

    out.push({
      source_id: `steam:${it.id}`,
      title: it.name,
      description: "",
      platform: "steam",
      genre: [],
      original_price: `R$ ${(it.original_price / 100).toFixed(2).replace(".", ",")}`,
      // Steam doesn't expose end date here; default 7 days
      free_until: new Date(Date.now() + 7 * 86400000).toISOString(),
      developer: "Steam",
      rating: 4.3,
      url: `https://store.steampowered.com/app/${it.id}/`,
      accent: ACCENTS.steam,
      image_url: it.header_image || it.large_capsule_image || null,
    });
  }
  return out;
}

// GamerPower — rastreador de giveaways de jogos pagos liberados
// Filtra: type=game (sem DLC/loot/beta), worth != N/A (exclui free-to-play),
// status=Active e plataforma Steam ou Epic.
async function fetchGamerPower(): Promise<NormalizedGame[]> {
  const res = await fetch(
    "https://www.gamerpower.com/api/giveaways?type=game&sort-by=value",
    { headers: { "User-Agent": "Mozilla/5.0 PortalGamerBot", Accept: "application/json" } },
  );
  if (!res.ok) throw new Error(`GamerPower API ${res.status}`);
  const items: any[] = await res.json();
  const out: NormalizedGame[] = [];

  for (const it of items) {
    if (!it || it.status !== "Active") continue;
    if (it.type && String(it.type).toLowerCase() !== "game") continue;
    const worth = String(it.worth ?? "").trim();
    if (!worth || worth === "N/A" || worth === "$0.00") continue; // exclui F2P

    const platformsRaw = String(it.platforms ?? "").toLowerCase();
    let platform: SupportedPlatform | null = null;
    if (platformsRaw.includes("epic")) platform = "epic";
    else if (platformsRaw.includes("steam")) platform = "steam";
    else if (platformsRaw.includes("gog") || platformsRaw.includes("drm-free")) platform = "gog";
    else if (platformsRaw.includes("amazon")) platform = "amazon";
    else if (platformsRaw.includes("itch")) platform = "itch";
    else if (platformsRaw.includes("xbox")) platform = "xbox";
    else if (platformsRaw.includes("discord")) platform = "discord";
    else continue;

    const url = String(it.open_giveaway_url || it.gamerpower_url || "");
    if (!url) continue;

    const endDate = it.end_date && it.end_date !== "N/A"
      ? new Date(it.end_date).toISOString()
      : new Date(Date.now() + 7 * 86400000).toISOString();

    out.push({
      source_id: `gp:${it.id}`,
      title: String(it.title ?? "").trim(),
      description: String(it.description ?? "").slice(0, 500),
      platform,
      genre: [],
      original_price: worth,
      free_until: endDate,
      developer: DEVELOPER_LABEL[platform],
      rating: 4.3,
      url,
      accent: ACCENTS[platform],
      image_url: it.image || it.thumbnail || null,
    });
  }
  return out;
}

// Validação final: garante que só jogos PAGOS com 100% off entrem no catálogo.
// Rejeita free-to-play, demos, betas, betas abertos, servidores privados, etc.
const F2P_PATTERNS = [
  /free[\s-]?to[\s-]?play/i,
  /\bf2p\b/i,
  /\bdemo\b/i,
  /\bbeta\b/i,
  /\balpha\b/i,
  /\bplaytest\b/i,
  /\bopen\s+test\b/i,
  /\bearly\s+access\s+key\b/i,
  /\bserver\s+access\b/i,
  /\bin-?game\b/i,
  /\bdlc\b/i,
  /\bloot\b/i,
  /\bskin\b/i,
  /\bcurrency\b/i,
  /\bcoins?\b/i,
  /\bgems?\b/i,
  /\bbooster\b/i,
  /\bpack\b/i,
];

function isPaidFreebie(g: NormalizedGame): boolean {
  const price = (g.original_price ?? "").trim();
  if (!price) return false;
  const lower = price.toLowerCase();
  if (["pago"].includes(lower)) {
    // marcador interno do Epic, ok
  } else {
    // Preço precisa conter dígito > 0 (R$ 0,00 / $0.00 / 0 são F2P)
    const numeric = price.replace(/[^\d.,]/g, "").replace(",", ".");
    const value = parseFloat(numeric);
    if (!isFinite(value) || value <= 0) {
      if (!/^pago$/i.test(price)) return false;
    }
    if (/^(free|gratis|grátis|n\/a)$/i.test(price)) return false;
  }

  const haystack = `${g.title}\n${g.description}`;
  if (F2P_PATTERNS.some((re) => re.test(haystack))) return false;

  return true;
}

export async function runSync(trigger: string): Promise<{
  inserted: number; updated: number; skipped: number; errors: number; message: string;
}> {
  let inserted = 0, updated = 0, skipped = 0, errors = 0;
  const errorDetails: string[] = [];
  let games: NormalizedGame[] = [];

  try {
    const [epic, steam, gp] = await Promise.allSettled([fetchEpic(), fetchSteam(), fetchGamerPower()]);
    if (epic.status === "fulfilled") games.push(...epic.value);
    else { errors++; errorDetails.push(`epic: ${epic.reason}`); }
    if (steam.status === "fulfilled") games.push(...steam.value);
    else { errors++; errorDetails.push(`steam: ${steam.reason}`); }
    if (gp.status === "fulfilled") games.push(...gp.value);
    else { errors++; errorDetails.push(`gamerpower: ${gp.reason}`); }
  } catch (e: any) {
    errors++; errorDetails.push(String(e?.message ?? e));
  }

  // Dedup by source_id
  const seenIds = new Set<string>();
  games = games.filter((g) => (seenIds.has(g.source_id) ? false : (seenIds.add(g.source_id), true)));

  // Dedup por título+plataforma (mesmo jogo vindo de fontes diferentes, ex.: Epic feed + GamerPower).
  // Prioridade de fonte: epic > steam > gp (oficiais antes de agregadores).
  const sourcePriority = (id: string) =>
    id.startsWith("epic:") ? 0 : id.startsWith("steam:") ? 1 : 2;
  const normalizeTitle = (t: string) =>
    t.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[™®©]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

  const byKey = new Map<string, NormalizedGame>();
  for (const g of games) {
    const key = `${g.platform}|${normalizeTitle(g.title)}`;
    const existing = byKey.get(key);
    if (!existing || sourcePriority(g.source_id) < sourcePriority(existing.source_id)) {
      byKey.set(key, g);
    }
  }
  games = Array.from(byKey.values());

  // Marca como não publicado registros antigos cujo source_id divergente representa o mesmo
  // título+plataforma que vamos sincronizar agora (evita ficar com duplicata legada no catálogo).
  try {
    const keepIds = games.map((g) => g.source_id);
    const { data: existingRows } = await supabaseAdmin
      .from("games")
      .select("id, title, platform, source_id")
      .eq("published", true);
    const winners = new Set(games.map((g) => `${g.platform}|${normalizeTitle(g.title)}`));
    const losers = (existingRows ?? []).filter((r: any) =>
      winners.has(`${r.platform}|${normalizeTitle(r.title)}`) && !keepIds.includes(r.source_id),
    );
    if (losers.length) {
      await supabaseAdmin
        .from("games")
        .update({ published: false })
        .in("id", losers.map((r: any) => r.id));
    }
  } catch (e: any) {
    errorDetails.push(`dedup-legacy: ${e?.message ?? e}`);
  }

  for (const g of games) {
    try {
      const { data: existing } = await supabaseAdmin
        .from("games").select("id").eq("source_id", g.source_id).maybeSingle();
      if (existing) {
        const { error } = await supabaseAdmin.from("games").update({
          title: g.title, description: g.description, platform: g.platform,
          genre: g.genre, original_price: g.original_price, free_until: g.free_until,
          developer: g.developer, rating: g.rating, url: g.url, accent: g.accent,
          image_url: g.image_url, published: true,
        }).eq("id", existing.id);
        if (error) throw error;
        updated++;
      } else {
        const { error } = await supabaseAdmin.from("games").insert({
          source_id: g.source_id,
          title: g.title, description: g.description, platform: g.platform,
          genre: g.genre, original_price: g.original_price, free_until: g.free_until,
          developer: g.developer, rating: g.rating, url: g.url, accent: g.accent,
          image_url: g.image_url, published: true,
        });
        if (error) throw error;
        inserted++;
      }

    } catch (e: any) {
      errors++; skipped++;
      errorDetails.push(`${g.source_id}: ${e?.message ?? e}`);
    }
  }

  // Despublica jogos cuja promoção expirou (não estão mais grátis hoje)
  try {
    await supabaseAdmin
      .from("games")
      .update({ published: false })
      .lt("free_until", new Date().toISOString())
      .eq("published", true);
  } catch (e: any) {
    errorDetails.push(`unpublish-expired: ${e?.message ?? e}`);
  }

  // Despublica qualquer jogo publicado que não apareça mais no feed ativo desta sincronização.
  // Cobre o caso de promoções encerradas antes da data prevista (Epic/Steam removem do feed sem aviso).
  // Só executa se pelo menos uma fonte respondeu com sucesso, para não limpar tudo em falha total.
  try {
    if (games.length > 0) {
      const keepIds = new Set(games.map((g) => g.source_id));
      const { data: published } = await supabaseAdmin
        .from("games")
        .select("id, source_id")
        .eq("published", true);
      const stale = (published ?? []).filter(
        (r: any) => !r.source_id || !keepIds.has(r.source_id),
      );
      if (stale.length) {
        await supabaseAdmin
          .from("games")
          .update({ published: false })
          .in("id", stale.map((r: any) => r.id));
      }
    }
  } catch (e: any) {
    errorDetails.push(`unpublish-missing: ${e?.message ?? e}`);
  }

  const message = `[${trigger}] ${inserted} novos, ${updated} atualizados, ${errors} erros`;
  await supabaseAdmin.from("sync_logs").insert({
    source: trigger, inserted_count: inserted, updated_count: updated,
    skipped_count: skipped, error_count: errors, message,
    details: errorDetails.length ? { errors: errorDetails.slice(0, 20) } : null,
  });

  return { inserted, updated, skipped, errors, message };
}
