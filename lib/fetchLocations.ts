"use cache";
import { createClient } from "@/lib/supabase/client";

export interface Location {
  brew_focus: string;
  description: string;
  has_bathroom: boolean;
  has_outlets: boolean;
  has_patio: boolean;
  has_wifi: boolean;
  is_verified: boolean;
  latitude: number;
  longitude: number;
  name: string;
  roast_level: string;
  vibe: string;
  rating: number;
  id: string;
}

export async function fetchLocations() {
  const supabase = createClient();
  const { data, error } = await supabase.from("cafes_public").select(`*`);

  if (error) {
    console.log(error.message);
    return [];
  } else {
    return data as Location[];
  }
}
