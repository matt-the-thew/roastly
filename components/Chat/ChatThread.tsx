"use client";
import { useEffect, useRef, useState } from "react";
import { useMapContext } from "@/lib/MapContext";
import {
  getMessages,
  sendMessage,
  markRead,
  subscribeToConversation,
  type Message,
} from "@/lib/supabase/chat";
import UserAvatar from "../Social/UserAvatar";
import { IoIosArrowBack } from "react-icons/io";
import { IoSend } from "react-icons/io5";
import toast from "react-hot-toast";

export default function ChatThread() {
  const { user, activeConversation, setOverlayView, refreshUnread } =
    useMapContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversationId = activeConversation?.id ?? null;
  const other = activeConversation?.other ?? null;

  // Load history, subscribe to realtime inserts, and mark inbound as read.
  useEffect(() => {
    if (!user || !conversationId) return;
    let active = true;

    getMessages(conversationId).then((m) => {
      if (active) setMessages(m);
    });
    markRead(conversationId, user.id).then(refreshUnread);

    const unsub = subscribeToConversation(conversationId, (msg) => {
      setMessages((prev) =>
        // Guard against echoing a message we already appended optimistically.
        prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
      );
      if (msg.sender_id !== user.id) {
        markRead(conversationId, user.id).then(refreshUnread);
      }
    });
    return () => {
      active = false;
      unsub();
    };
  }, [user, conversationId, refreshUnread]);

  // Keep the newest message in view.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const body = draft.trim();
    if (!body || !user || !conversationId || sending) return;
    setSending(true);
    setDraft("");
    try {
      const msg = await sendMessage(conversationId, user.id, body);
      setMessages((prev) =>
        prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
      );
    } catch (e) {
      setDraft(body); // restore on failure
      toast.error(
        e instanceof Error && e.message.includes("friends")
          ? "You can only message current friends."
          : "Couldn't send message.",
      );
    } finally {
      setSending(false);
    }
  }

  if (!other) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
        <button
          onClick={() => setOverlayView("conversationList")}
          className="text-gray-400 hover:text-foreground cursor-pointer"
          aria-label="Back to messages"
        >
          <IoIosArrowBack className="text-lg" />
        </button>
        <UserAvatar
          displayName={other.display_name}
          username={other.username}
          avatarUrl={other.avatar_url}
          size={32}
        />
        <span className="font-bold text-sm truncate">
          {other.display_name || other.username}
        </span>
      </div>

      {/* Messages */}
      <div className="overflow-y-auto flex-1 flex flex-col gap-2 p-4">
        {messages.length === 0 && (
          <p className="font-mono text-xs text-gray-300 text-center mt-4">
            Say hello 👋
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === user?.id;
          return (
            <div
              key={m.id}
              className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-5 ${
                mine
                  ? "self-end bg-primary text-white rounded-br-sm"
                  : "self-start bg-gray-100 text-foreground rounded-bl-sm"
              }`}
            >
              {m.body}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="p-3 border-t border-gray-100 flex items-end gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          maxLength={2000}
          placeholder="Message…"
          className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary max-h-32"
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim() || sending}
          className="w-9 h-9 shrink-0 rounded-full bg-primary text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 cursor-pointer disabled:cursor-default"
          aria-label="Send"
        >
          <IoSend className="text-sm" />
        </button>
      </div>
    </div>
  );
}
