"use client";
import { browserClient } from "@/lib/supabase/client";
import type { Profile } from "./profile";

export interface Like {
  id: string;
  user_id: string;
  cafe_id: string;
  created_at: string;
}

export interface LikeWithProfile extends Like {
  profiles: Pick<
    Profile,
    "id" | "username" | "display_name" | "avatar_url" | "is_private"
  >;
}

/** Total like count for a cafe (always public) */
export async function getLikeCount(cafeId: string): Promise<number> {
  const supabase = browserClient();
  const { count } = await supabase
    .from("likes")
    .select("id", { count: "exact", head: true })
    .eq("cafe_id", cafeId);
  return count ?? 0;
}

/** Like counts for multiple cafes at once */
export async function getLikeCounts(
  cafeIds: string[],
): Promise<Record<string, number>> {
  if (cafeIds.length === 0) return {};
  const supabase = browserClient();
  const { data } = await supabase
    .from("likes")
    .select("cafe_id")
    .in("cafe_id", cafeIds);
  const counts: Record<string, number> = {};
  for (const id of cafeIds) counts[id] = 0;
  for (const row of data ?? [])
    counts[row.cafe_id] = (counts[row.cafe_id] ?? 0) + 1;
  return counts;
}

/** Whether the current user has liked a cafe */
export async function getUserLike(
  userId: string,
  cafeId: string,
): Promise<boolean> {
  const supabase = browserClient();
  const { data } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", userId)
    .eq("cafe_id", cafeId)
    .maybeSingle();
  return data !== null;
}

/** All cafes a user has liked (for profile page) */
export async function getUserLikedCafeIds(userId: string): Promise<string[]> {
  const supabase = browserClient();
  const { data } = await supabase
    .from("likes")
    .select("cafe_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => r.cafe_id);
}

/**
 * Likes with profile info for a cafe — used to show friend attribution.
 * Returns all likers; caller filters by friendship.
 */
export async function getLikersForCafe(
  cafeId: string,
): Promise<LikeWithProfile[]> {
  const supabase = browserClient();
  const { data } = await supabase
    .from("likes")
    .select(
      "id, user_id, cafe_id, created_at, profiles(id, username, display_name, avatar_url, is_private)",
    )
    .eq("cafe_id", cafeId)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as LikeWithProfile[];
}

export async function toggleLike(
  userId: string,
  cafeId: string,
  currentlyLiked: boolean,
): Promise<void> {
  const supabase = browserClient();
  if (currentlyLiked) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("user_id", userId)
      .eq("cafe_id", cafeId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("likes")
      .insert({ user_id: userId, cafe_id: cafeId });
    if (error) throw new Error(error.message);
  }
}
