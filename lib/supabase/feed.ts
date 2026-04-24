"use client";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "./profile";

export interface FeedEntry {
  id: string;
  user_id: string;
  cafe_id: string;
  cafe_name: string;
  created_at: string;
  profile: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
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
  const supabase = createClient();

  const { data } = await supabase
    .from("likes")
    .select(
      "id, user_id, cafe_id, created_at, profiles(id, username, display_name, avatar_url), cafes(name)",
    )
    .in("user_id", friendIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    cafe_id: row.cafe_id,
    cafe_name: row.cafes?.name ?? "Unknown cafe",
    created_at: row.created_at,
    profile: row.profiles,
  }));
}
