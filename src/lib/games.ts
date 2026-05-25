export type Platform = "epic" | "steam" | "gog" | "playstation" | "xbox";

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
