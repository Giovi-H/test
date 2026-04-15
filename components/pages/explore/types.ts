export type ViewMode = 'list' | 'map';

export type NearbyCafe = {
  fsq_place_id: string;
  name: string;
  location?: { address?: string; locality?: string } | null;
  distance?: number;
  latitude?: number;
  longitude?: number;
};
