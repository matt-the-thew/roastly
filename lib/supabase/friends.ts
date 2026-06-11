"use client";
import { browserClient } from "@/lib/supabase/client";
import type { Profile } from "./profile";

export type FriendshipStatus = "pending" | "accepted" | "denied";

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  expires_at: string;
}

export interface FriendshipWithProfile extends Friendship {
  profiles: Pick<
    Profile,
    "id" | "username" | "display_name" | "avatar_url" | "is_private"
  >;
}

/** All accepted friends for a user, with their profile data */
export async function getFriends(userId: string): Promise<Profile[]> {
  const supabase = browserClient();
  // Two queries: rows where user is requester or addressee
  const [{ data: sent }, { data: received }] = await Promise.all([
    supabase
      .from("friendships")
      .select(
        "addressee_id, profiles!friendships_addressee_id_fkey(id, username, display_name, avatar_url, is_private, friend_code, bio, created_at)",
      )
      .eq("requester_id", userId)
      .eq("status", "accepted"),
    supabase
      .from("friendships")
      .select(
        "requester_id, profiles!friendships_requester_id_fkey(id, username, display_name, avatar_url, is_private, friend_code, bio, created_at)",
      )
      .eq("addressee_id", userId)
      .eq("status", "accepted"),
  ]);
  const friends: Profile[] = [];
  for (const row of sent ?? []) {
    if (row.profiles) friends.push(row.profiles as unknown as Profile);
  }
  for (const row of received ?? []) {
    if (row.profiles) friends.push(row.profiles as unknown as Profile);
  }
  return friends;
}

/** IDs of all accepted friends (fast set lookup) */
export async function getFriendIds(userId: string): Promise<Set<string>> {
  const friends = await getFriends(userId);
  return new Set(friends.map((f) => f.id));
}

/** Pending requests received by this user */
export async function getIncomingRequests(
  userId: string,
): Promise<FriendshipWithProfile[]> {
  const supabase = browserClient();
  const { data } = await supabase
    .from("friendships")
    .select(
      "*, profiles!friendships_requester_id_fkey(id, username, display_name, avatar_url, is_private)",
    )
    .eq("addressee_id", userId)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString());
  return (data ?? []) as FriendshipWithProfile[];
}

/** Pending requests sent by this user */
export async function getOutgoingRequests(
  userId: string,
): Promise<Friendship[]> {
  const supabase = browserClient();
  const { data } = await supabase
    .from("friendships")
    .select("*")
    .eq("requester_id", userId)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString());
  return (data ?? []) as Friendship[];
}

/** Returns existing friendship row between two users regardless of direction */
export async function getFriendship(
  userId: string,
  otherId: string,
): Promise<Friendship | null> {
  const supabase = browserClient();
  const { data } = await supabase
    .from("friendships")
    .select("*")
    .or(
      `and(requester_id.eq.${userId},addressee_id.eq.${otherId}),and(requester_id.eq.${otherId},addressee_id.eq.${userId})`,
    )
    .maybeSingle();
  return (data as Friendship) ?? null;
}

export async function sendFriendRequest(
  requesterId: string,
  addresseeId: string,
): Promise<void> {
  const supabase = browserClient();
  const { error } = await supabase
    .from("friendships")
    .insert({ requester_id: requesterId, addressee_id: addresseeId });
  if (error) throw new Error(error.message);
}

export async function respondToRequest(
  friendshipId: string,
  response: "accepted" | "denied",
): Promise<void> {
  const supabase = browserClient();
  const { error } = await supabase
    .from("friendships")
    .update({ status: response })
    .eq("id", friendshipId);
  if (error) throw new Error(error.message);
}

export async function removeFriend(
  userId: string,
  friendId: string,
): Promise<void> {
  const supabase = browserClient();
  const { error } = await supabase
    .from("friendships")
    .delete()
    .or(
      `and(requester_id.eq.${userId},addressee_id.eq.${friendId}),and(requester_id.eq.${friendId},addressee_id.eq.${userId})`,
    );
  if (error) throw new Error(error.message);
}

/** Mutual friends between two users */
export async function getMutualFriends(
  userId: string,
  otherId: string,
): Promise<Profile[]> {
  const [myFriends, theirFriends] = await Promise.all([
    getFriends(userId),
    getFriends(otherId),
  ]);
  const myIds = new Set(myFriends.map((f) => f.id));
  return theirFriends.filter((f) => myIds.has(f.id));
}
