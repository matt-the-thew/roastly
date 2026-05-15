import { createClient } from "@/lib/supabase/client";

export interface Location {
  description: string;
  is_verified: boolean;
  latitude: number;
  longitude: number;
  name: string;
  vibe: string;
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
