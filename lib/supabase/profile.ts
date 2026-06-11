"use client";
import { browserClient } from "@/lib/supabase/client";

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  friend_code: string;
  is_private: boolean;
  created_at: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = browserClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data ?? null;
}

export async function getProfileByUsername(
  username: string,
): Promise<Profile | null> {
  const supabase = browserClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();
  return data ?? null;
}

export async function getProfileByFriendCode(
  code: string,
): Promise<Profile | null> {
  const supabase = browserClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("friend_code", code.toUpperCase())
    .single();
  return data ?? null;
}

export async function createProfile(
  userId: string,
  username: string,
  displayName: string,
  bio: string = "",
  avatarUrl: string = "",
): Promise<Profile | null> {
  const supabase = browserClient();
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      username,
      display_name: displayName,
      bio,
      avatar_url: avatarUrl,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateProfile(
  userId: string,
  updates: Partial<
    Pick<Profile, "display_name" | "bio" | "avatar_url" | "is_private">
  >,
): Promise<void> {
  const supabase = browserClient();
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);
  if (error) throw new Error(error.message);
}

export async function isUsernameAvailable(
  username: string,
): Promise<boolean> {
  const supabase = browserClient();
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  return data === null;
}

/** Returns initials from a display name, e.g. "John Doe" → "JD" \
 * @param {string} displayName - The string to be abbreviated
 * @returns {string} - first and last, no matter how many names
 */
export function getInitials(displayName: string): string | Error {
  //if display name undefined, return Error
  if (!displayName) {
    console.warn("[WARNING]: parameter displayName is not defined");
    return "";
  }
  let last: string | undefined;
  //get first letter of each word
  //split into array of words
  const uppercaseChars: Array<string> = displayName
    //handle multiple spaces
    .trim()
    //split by any repeating spaces
    .split(/\s+/)
    //make first char of all entries uppercase
    .map((w) => w[0].toUpperCase());
  //get first uppercase letter
  const first = uppercaseChars.at(0);
  //get last uppercase letter if more than one name
  if (uppercaseChars.length > 1) {
    last = uppercaseChars.at(-1);
    return first! + last;
  } else return first!;
}

/** Deterministic background color from a string */
export function getAvatarColor(seed: string): string {
  const colors = [
    "#e07b39",
    "#5b8dd9",
    "#6bbf72",
    "#c96b6b",
    "#9b6bc9",
    "#d4a84b",
    "#4bbdca",
    "#c96b9b",
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
