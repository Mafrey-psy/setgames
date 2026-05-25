export type Platform = "epic" | "steam";

export interface Game {
  id: string;
  title: string;
  description: string;
  platform: Platform;
  genre: string[];
  originalPrice: string;
  freeUntil: string; // ISO date
  developer: string;
  rating: number; // 0-5
  url: string;
  imagePrompt: string; // used as fallback color theme
  accent: string; // hex-ish for gradient
}

export const games: Game[] = [
  {
    id: "control",
    title: "Control: Ultimate Edition",
    description: "Mergulhe em uma agência paranormal com poderes telecinéticos e arquitetura brutalista que se reconfigura.",
    platform: "epic",
    genre: ["Ação", "Supernatural", "Singleplayer"],
    originalPrice: "R$ 199,90",
    freeUntil: "2026-06-05",
    developer: "Remedy Entertainment",
    rating: 4.6,
    url: "https://store.epicgames.com",
    imagePrompt: "control",
    accent: "from-fuchsia-600 to-rose-500",
  },
  {
    id: "fallguys",
    title: "Fall Guys",
    description: "Bata-se em obstáculos coloridos contra 60 jogadores em um show de party-royale caótico e divertido.",
    platform: "epic",
    genre: ["Party", "Multijogador", "Casual"],
    originalPrice: "Free-to-Play",
    freeUntil: "2026-12-31",
    developer: "Mediatonic",
    rating: 4.2,
    url: "https://store.epicgames.com",
    imagePrompt: "fall guys",
    accent: "from-pink-500 to-amber-400",
  },
  {
    id: "alanwake",
    title: "Alan Wake Remastered",
    description: "Um thriller psicológico onde a luz é sua única arma contra a escuridão que devora a realidade.",
    platform: "epic",
    genre: ["Survival", "Thriller", "Narrativo"],
    originalPrice: "R$ 119,90",
    freeUntil: "2026-06-12",
    developer: "Remedy",
    rating: 4.4,
    url: "https://store.epicgames.com",
    imagePrompt: "alan wake",
    accent: "from-amber-500 to-stone-700",
  },
  {
    id: "dota2",
    title: "Dota 2",
    description: "O MOBA mais profundo do mundo. Estratégia, mecânica e teamplay em 5v5 competitivo.",
    platform: "steam",
    genre: ["MOBA", "Competitivo", "Multijogador"],
    originalPrice: "Free-to-Play",
    freeUntil: "2099-01-01",
    developer: "Valve",
    rating: 4.5,
    url: "https://store.steampowered.com",
    imagePrompt: "dota",
    accent: "from-red-600 to-orange-500",
  },
  {
    id: "warthunder",
    title: "War Thunder",
    description: "Combates aéreos, terrestres e navais em uma simulação militar histórica realista e cinemática.",
    platform: "steam",
    genre: ["Simulação", "Veículos", "Militar"],
    originalPrice: "Free-to-Play",
    freeUntil: "2099-01-01",
    developer: "Gaijin",
    rating: 4.1,
    url: "https://store.steampowered.com",
    imagePrompt: "warthunder",
    accent: "from-emerald-700 to-stone-600",
  },
  {
    id: "warframe",
    title: "Warframe",
    description: "Ninja-espacial cooperativo com loot infinito, movimentação fluida e atualizações há mais de uma década.",
    platform: "steam",
    genre: ["Looter Shooter", "Ação", "Cooperativo"],
    originalPrice: "Free-to-Play",
    freeUntil: "2099-01-01",
    developer: "Digital Extremes",
    rating: 4.7,
    url: "https://store.steampowered.com",
    imagePrompt: "warframe",
    accent: "from-cyan-500 to-indigo-600",
  },
];

export const getByPlatform = (p: Platform) => games.filter((g) => g.platform === p);
