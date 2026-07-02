"use client";
import { browserClient } from "@/lib/supabase/client";
import type { Profile } from "./profile";

export interface FeedEntry {
  id: string;
  user_id: string;
  cafe_id: string;
  cafe_name: string;
  created_at: string;
  profile: Pick<
    Profile,
    "id" | "username" | "display_name" | "avatar_url"
  >;
}

/**
 * Returns the chronological like activity of a user's friends.
 * Filters to only accepted friends; respects private accounts
 * (private friends still appear in YOUR feed).
 */
export async function getSocialFeed(
  userId: string,
  friendIds: string[],
  limit = 50,
): Promise<FeedEntry[]> {
  if (friendIds.length === 0) return [];
  const supabase = browserClient();

  const { data } = await supabase
    .from("likes")
    .select(
      "id, user_id, cafe_id, created_at, profiles(id, username, display_name, avatar_url), cafes(name)",
    )
    .in("user_id", friendIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  type LikeRow = {
    id: string;
    user_id: string;
    cafe_id: string;
    created_at: string;
    profiles:
      | Pick<Profile, "id" | "username" | "display_name" | "avatar_url">
      | Pick<Profile, "id" | "username" | "display_name" | "avatar_url">[]
      | null;
    cafes: { name: string } | { name: string }[] | null;
  };

  return (data ?? []).map((row: LikeRow) => {
    // PostgREST embeds a to-one relation as an object, but can surface it as a
    // single-element array depending on how the relationship is inferred.
    // Normalize both shapes. (Previously this read `row.profile` — the wrong
    // key — so every feed entry's profile silently resolved to null.)
    const profileRel = Array.isArray(row.profiles)
      ? row.profiles[0]
      : row.profiles;
    const cafeRel = Array.isArray(row.cafes) ? row.cafes[0] : row.cafes;
    return {
      id: row.id,
      user_id: row.user_id,
      cafe_id: row.cafe_id,
      cafe_name: cafeRel?.name ?? "Unknown cafe",
      created_at: row.created_at,
      profile: profileRel!,
    };
  });
}
