"use server";
import { createClient } from "@/lib/supabase/client";
import { cacheLife } from "next/cache";

export interface Location {
  description: string;
  is_verified: boolean;
  latitude: number;
  longitude: number;
  name: string;
  vibe: string;
}

export async function fetchLocations() {
  "use cache";
  cacheLife("hours");
  const supabase = createClient();
  const { data, error } = await supabase.from("cafe_list_view").select(`*`);
  console.log("Calling cafes");

  if (error) {
    console.log(error.message);
    return [];
  } else {
    return data as Location[];
  }
}
