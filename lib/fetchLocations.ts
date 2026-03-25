import { createClient } from "@/lib/supabase/client";
import { log } from "./logger";

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
}

export async function fetchLocations(
  locationDestinationArray?: Array<Location> | null,
) {
  const supabase = createClient();
  const { data, error } = await supabase.from("cafes_public").select(`*`);

  if (error) {
    console.log(error.message);
    return [];
  } else {
    return data as Location[];
  }
}
