// Server-only: free games sync logic (Epic + Steam)
import { supabaseAdmin } from "@/integrations/supabase/client.server";

interface NormalizedGame {
  source_id: string;
  title: string;
  description: string;
  platform: "epic" | "steam";
  genre: string[];
  original_price: string;
  free_until: string; // ISO
  developer: string;
  rating: number;
  url: string;
  accent: string;
  image_url: string | null;
}

const ACCENTS = {
  epic: "from-fuchsia-600 to-rose-500",
  steam: "from-sky-500 to-indigo-600",
} as const;

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
    });
  }
  return out;
}

export async function runSync(trigger: string): Promise<{
  inserted: number; updated: number; skipped: number; errors: number; message: string;
}> {
  let inserted = 0, updated = 0, skipped = 0, errors = 0;
  const errorDetails: string[] = [];
  let games: NormalizedGame[] = [];

  try {
    const [epic, steam] = await Promise.allSettled([fetchEpic(), fetchSteam()]);
    if (epic.status === "fulfilled") games.push(...epic.value);
    else { errors++; errorDetails.push(`epic: ${epic.reason}`); }
    if (steam.status === "fulfilled") games.push(...steam.value);
    else { errors++; errorDetails.push(`steam: ${steam.reason}`); }
  } catch (e: any) {
    errors++; errorDetails.push(String(e?.message ?? e));
  }

  // Dedup by source_id
  const seen = new Set<string>();
  games = games.filter((g) => (seen.has(g.source_id) ? false : (seen.add(g.source_id), true)));

  for (const g of games) {
    try {
      const { data: existing } = await supabaseAdmin
        .from("games").select("id").eq("source_id", g.source_id).maybeSingle();
      if (existing) {
        const { error } = await supabaseAdmin.from("games").update({
          title: g.title, description: g.description, platform: g.platform,
          genre: g.genre, original_price: g.original_price, free_until: g.free_until,
          developer: g.developer, rating: g.rating, url: g.url, accent: g.accent,
          published: true,
        }).eq("id", existing.id);
        if (error) throw error;
        updated++;
      } else {
        const { error } = await supabaseAdmin.from("games").insert({
          source_id: g.source_id,
          title: g.title, description: g.description, platform: g.platform,
          genre: g.genre, original_price: g.original_price, free_until: g.free_until,
          developer: g.developer, rating: g.rating, url: g.url, accent: g.accent,
          published: true,
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

  const message = `[${trigger}] ${inserted} novos, ${updated} atualizados, ${errors} erros`;
  await supabaseAdmin.from("sync_logs").insert({
    source: trigger, inserted_count: inserted, updated_count: updated,
    skipped_count: skipped, error_count: errors, message,
    details: errorDetails.length ? { errors: errorDetails.slice(0, 20) } : null,
  });

  return { inserted, updated, skipped, errors, message };
}
