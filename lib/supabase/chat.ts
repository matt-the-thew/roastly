"use client";
import { browserClient } from "@/lib/supabase/client";
import type { Profile } from "./profile";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface Conversation {
  id: string;
  user_a: string;
  user_b: string;
  created_at: string;
  last_message_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

type ChatProfile = Pick<
  Profile,
  "id" | "username" | "display_name" | "avatar_url"
>;

/** A conversation enriched for the inbox list: the *other* participant,
 *  a preview of the last message, and how many inbound messages are unread. */
export interface ConversationSummary {
  id: string;
  other: ChatProfile;
  lastMessageAt: string;
  lastMessageBody: string | null;
  unreadCount: number;
}

/**
 * Returns the caller's conversations, most-recent first, with the other
 * participant's profile, a last-message preview, and an unread count.
 * Two round trips (conversations, then a batched message read) keep this
 * simple; message volume per user is small.
 */
export async function getConversations(
  userId: string,
): Promise<ConversationSummary[]> {
  const supabase = browserClient();
  const { data: convos } = await supabase
    .from("conversations")
    .select(
      `id, last_message_at,
       a:profiles!conversations_user_a_fkey(id, username, display_name, avatar_url),
       b:profiles!conversations_user_b_fkey(id, username, display_name, avatar_url)`,
    )
    .order("last_message_at", { ascending: false });

  if (!convos || convos.length === 0) return [];

  const summaries: ConversationSummary[] = [];
  for (const c of convos) {
    // The other participant is whichever participant does not possess
    // the calling user's userId.
    const a = c.a as unknown as ChatProfile;
    const b = c.b as unknown as ChatProfile;
    const other = a.id === userId ? b : a;

    // Last message + unread count for this conversation.
    const [{ data: last }, { count }] = await Promise.all([
      supabase
        .from("messages")
        .select("body")
        .eq("conversation_id", c.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", c.id)
        .neq("sender_id", userId)
        .is("read_at", null),
    ]);

    summaries.push({
      id: c.id,
      other,
      lastMessageAt: c.last_message_at,
      lastMessageBody: last?.body ?? null,
      unreadCount: count ?? 0,
    });
  }
  return summaries;
}

/** Total unread inbound messages across all conversations (for the inbox badge). */
export async function getTotalUnread(userId: string): Promise<number> {
  const supabase = browserClient();
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .neq("sender_id", userId)
    .is("read_at", null);
  return count ?? 0;
}

/** Get (or lazily create) the conversation between the caller and `otherId`.
 *  Fails if the two users are not accepted friends (enforced by the RPC). */
export async function getOrCreateConversation(
  otherId: string,
): Promise<Conversation> {
  const supabase = browserClient();
  const { data, error } = await supabase.rpc("get_or_create_conversation", {
    other_id: otherId,
  });
  if (error) throw new Error(error.message);
  return data as Conversation;
}

/** Messages in a conversation, oldest-first for rendering. Pass `before`
 *  (an ISO timestamp) to page backwards into older history. */
export async function getMessages(
  conversationId: string,
  opts: { before?: string; limit?: number } = {},
): Promise<Message[]> {
  const supabase = browserClient();
  const limit = opts.limit ?? 50;
  let query = supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (opts.before) query = query.lt("created_at", opts.before);
  const { data } = await query;
  // Fetched newest-first for the limit; reverse to render oldest-first.
  return ((data ?? []) as Message[]).reverse();
}

/** Send a message. The DB trigger bumps the conversation's last_message_at. */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string,
): Promise<Message> {
  const supabase = browserClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      body: body.trim(),
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as Message;
}

/** Mark all inbound (not-mine) unread messages in a conversation as read. */
export async function markRead(
  conversationId: string,
  userId: string,
): Promise<void> {
  const supabase = browserClient();
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .is("read_at", null);
}

/** Subscribe to new messages in a conversation. Returns an unsubscribe fn.
 *  RLS is enforced on the realtime stream, so only permitted rows arrive. */
export function subscribeToConversation(
  conversationId: string,
  onInsert: (message: Message) => void,
): () => void {
  const supabase = browserClient();
  const channel: RealtimeChannel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => onInsert(payload.new as Message),
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

/** Subscribe to any new inbound message across the user's conversations, to
 *  refresh the inbox / unread badge. Broad channel; caller re-fetches counts. */
export function subscribeToInbox(onChange: () => void): () => void {
  const supabase = browserClient();
  const channel = supabase
    // Unique per subscriber: `supabase.channel()` returns the existing
    // channel object for a topic that's already subscribed, and calling
    // `.on()` on an already-subscribed channel throws. Each caller
    // (MapContext, ConversationList, ...) needs its own channel instance.
    .channel(`inbox:${crypto.randomUUID()}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      () => onChange(),
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
