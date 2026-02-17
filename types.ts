
export interface TripPlanRequest {
  destination: string;
  days: number;
  travelers: 'solo' | 'couple' | 'family' | 'group';
  style: 'adventure' | 'luxury' | 'budget' | 'culture' | 'nature';
  interests: string[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
  };
}

export interface TripPlanResponse {
  content: string;
  groundingLinks: GroundingChunk[];
}

export enum TravelStyle {
  ADVENTURE = 'adventure',
  LUXURY = 'luxury',
  BUDGET = 'budget',
  CULTURE = 'culture',
  NATURE = 'nature'
}

export const INTEREST_OPTIONS = [
  "Hrady a zámky",
  "Hory a turistika",
  "Gastronomie",
  "Moderní architektura",
  "Muzea",
  "Noční život",
  "Lázně a relax",
  "Pro děti"
];
