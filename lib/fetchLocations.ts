import { createClient } from "@/lib/supabase/client";

interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  name: string;
  location: Coordinates;
  roastLevel: string;
  brewFocus: string;
  vibe: string;
  description: string;
  hasWifi: boolean;
  hasBathroom: boolean;
  hasOutlets: boolean;
  hasPatio: boolean;
  isVerified: boolean;
}

async function fetchLocations(
  locationDestinationArray: Array<Location> | null,
) {
  const supabase = createClient();
  const { data, error } = await supabase.from("cafes").select(`
      name,
      
      `);
}
