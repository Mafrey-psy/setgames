import { supabase } from "@/integrations/supabase/client";
import type { Game, Platform } from "./games";

export interface Guide {
  id: string;
  title: string;
  description: string;
  icon: string;
  readTime: string;
  content: string;
}

export interface CulturePost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
}

function rowToGame(r: any): Game {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    platform: r.platform,
    genre: r.genre ?? [],
    originalPrice: r.original_price,
    freeUntil: r.free_until,
    developer: r.developer,
    rating: Number(r.rating),
    url: r.url,
    accent: r.accent,
    imageUrl: r.image_url ?? null,
    reviewsSummary: r.reviews_summary ?? null,
  };
}

export async function fetchGame(id: string): Promise<Game | null> {
  const { data, error } = await supabase
    .from("games").select("*").eq("id", id).eq("published", true).maybeSingle();
  if (error) throw error;
  return data ? rowToGame(data) : null;
}


export async function fetchGames(platform?: Platform): Promise<Game[]> {
  let q = supabase
    .from("games")
    .select("*")
    .eq("published", true)
    .gt("free_until", new Date().toISOString())
    .order("free_until", { ascending: true });
  if (platform) q = q.eq("platform", platform);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(rowToGame);
}


export async function fetchGuides(): Promise<Guide[]> {
  const { data, error } = await supabase
    .from("guides")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToGuide);
}

export async function fetchGuide(id: string): Promise<Guide | null> {
  const { data, error } = await supabase
    .from("guides").select("*").eq("id", id).eq("published", true).maybeSingle();
  if (error) throw error;
  return data ? rowToGuide(data) : null;
}

function rowToGuide(r: any): Guide {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    icon: r.icon,
    readTime: r.read_time,
    content: r.content ?? "",
  };
}

export async function fetchCulturePosts(): Promise<CulturePost[]> {
  const { data, error } = await supabase
    .from("culture_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToCulture);
}

export async function fetchCulturePost(slug: string): Promise<CulturePost | null> {
  const { data, error } = await supabase
    .from("culture_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToCulture(data) : null;
}

function rowToCulture(r: any): CulturePost {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    content: r.content,
    author: r.author,
    publishedAt: r.published_at,
  };
}
