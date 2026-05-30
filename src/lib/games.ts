export type Platform =
  | "epic"
  | "steam"
  | "gog"
  | "amazon"
  | "itch"
  | "xbox"
  | "discord"
  | "playstation";

export const PLATFORM_LABELS: Record<Platform, string> = {
  epic: "Epic Games",
  steam: "Steam",
  gog: "GOG",
  amazon: "Prime Gaming",
  itch: "Itch.io",
  xbox: "Xbox Cloud",
  discord: "Discord",
  playstation: "PlayStation",
};

export interface Game {
  id: string;
  title: string;
  description: string;
  platform: Platform;
  genre: string[];
  originalPrice: string;
  freeUntil: string;
  developer: string;
  rating: number;
  url: string;
  accent: string;
  imageUrl: string | null;
  reviewsSummary: string | null;
}
