"use server";
import { browserClient } from "@/lib/supabase/client";

export interface Location {
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
  console.log("Calling cafes");

  if (error) {
    console.log(error.message);
    return [];
  } else {
    return data as Location[];
  }
}
