"use client";
import { createClient } from "@/lib/supabase/client";

export interface CafeImage {
  id: string;
  cafe_id: string;
  storage_path: string;
  display_order: number;
}

export async function getCafeImages(cafeId: string): Promise<CafeImage[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("cafe_images")
    .select("id, cafe_id, storage_path, display_order")
    .eq("cafe_id", cafeId)
    .order("display_order");
  return (data ?? []) as CafeImage[];
}

export async function getCafeImagesForMany(cafeIds: string[]): Promise<Record<string, CafeImage[]>> {
  if (cafeIds.length === 0) return {};
  const supabase = createClient();
  const { data } = await supabase
    .from("cafe_images")
    .select("id, cafe_id, storage_path, display_order")
    .in("cafe_id", cafeIds)
    .order("display_order");
  const result: Record<string, CafeImage[]> = {};
  for (const row of data ?? []) {
    if (!result[row.cafe_id]) result[row.cafe_id] = [];
    result[row.cafe_id].push(row as CafeImage);
  }
  return result;
}

export function getPublicUrl(storagePath: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from("cafe-images").getPublicUrl(storagePath);
  return data.publicUrl;
}
