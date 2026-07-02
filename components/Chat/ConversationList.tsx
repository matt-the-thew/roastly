"use client";
import { useEffect, useState } from "react";
import { useMapContext } from "@/lib/MapContext";
import {
  getConversations,
  subscribeToInbox,
  type ConversationSummary,
} from "@/lib/supabase/chat";
import UserAvatar from "../Social/UserAvatar";
import { timeAgo } from "../Social/SocialFeed";
import { IoIosArrowBack } from "react-icons/io";

export default function ConversationList() {
  const { user, openConversation, setOverlayView } = useMapContext();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const load = () =>
      getConversations(user.id).then((c) => {
        setConversations(c);
        setLoading(false);
      });
    load();
    // Any new message anywhere refreshes the inbox (previews + unread counts).
    const unsub = subscribeToInbox(load);
    return unsub;
  }, [user]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex items-center gap-2">
        <button
          onClick={() => setOverlayView("cafeList")}
          className="text-gray-400 hover:text-foreground cursor-pointer"
          aria-label="Back to cafes"
        >
          <IoIosArrowBack className="text-lg" />
        </button>
        <h2 className="font-mono text-sm font-bold uppercase tracking-wide text-gray-500">
          Messages
        </h2>
      </div>

      <div className="overflow-y-auto flex-1 flex flex-col">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <p className="font-mono text-sm text-gray-400">Loading…</p>
          </div>
        )}
        {!loading && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 p-6 text-center">
            <p className="font-mono text-sm text-gray-400">No messages yet.</p>
            <p className="font-mono text-xs text-gray-300">
              Open a friend&apos;s profile and tap Message to start chatting.
            </p>
          </div>
        )}
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => openConversation(c.id, c.other)}
            className="flex items-start gap-3 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors text-left cursor-pointer"
          >
            <div className="shrink-0 relative">
              <UserAvatar
                displayName={c.other.display_name}
                username={c.other.username}
                avatarUrl={c.other.avatar_url}
                size={40}
              />
              {c.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[10px] font-mono flex items-center justify-center">
                  {c.unreadCount}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-sm truncate ${c.unreadCount > 0 ? "font-bold" : "font-medium"}`}
                >
                  {c.other.display_name || c.other.username}
                </span>
                <span className="text-[11px] font-mono text-gray-400 shrink-0">
                  {timeAgo(c.lastMessageAt)}
                </span>
              </div>
              <p
                className={`text-xs truncate ${c.unreadCount > 0 ? "text-gray-600" : "text-gray-400"}`}
              >
                {c.lastMessageBody ?? "No messages yet"}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
