import { browserClient } from "@/lib/supabase/client";
import type { BoundingBox } from "@/lib/boundingBox";

export interface Location {
  id: string;
  description: string;
  is_verified: boolean;
  latitude: number;
  longitude: number;
  name: string;
  vibe: string;
}

export async function fetchLocations() {
  const supabase = browserClient();
  const { data, error } = await supabase
    .from("cafe_list_view")
    .select(`*`);

  if (error) {
    console.log(error.message);
    return [];
  } else {
    return data as Location[];
  }
}

export async function fetchLocationsInBounds(bounds: BoundingBox) {
  const supabase = browserClient();
  const { data, error } = await supabase
    .from("cafe_list_view")
    .select("*")
    .gte("latitude", bounds.minLat)
    .lte("latitude", bounds.maxLat)
    .gte("longitude", bounds.minLng)
    .lte("longitude", bounds.maxLng);

  if (error) {
    console.log(error.message);
    return [];
  } else {
    return data as Location[];
  }
}
