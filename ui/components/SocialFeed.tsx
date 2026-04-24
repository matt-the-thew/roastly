"use client";
import { useEffect, useState } from "react";
import { useMapContext } from "@/lib/MapContext";
import { getSocialFeed, type FeedEntry } from "@/lib/supabase/feed";
import UserAvatar from "./UserAvatar";
import { useRouter } from "next/navigation";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function SocialFeed() {
  const { user, friendIds } = useMapContext();
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const ids = Array.from(friendIds);
    getSocialFeed(user.id, ids).then((entries) => {
      setFeed(entries);
      setLoading(false);
    });
  }, [user, friendIds]);

  return (
    <div className="flex flex-col h-full relative">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wide text-gray-500">
          Friend activity
        </h2>
      </div>
      <div className="overflow-y-auto flex-1 flex flex-col">
        {!user && (
          <div className="flex flex-col items-center justify-center h-full gap-2 p-6 text-center">
            <p className="font-mono text-sm text-gray-400">
              Sign in to see what your friends are liking.
            </p>
            <button
              onClick={() => router.push("/auth/login")}
              className="text-sm font-mono text-primary hover:underline cursor-pointer"
            >
              Sign in →
            </button>
          </div>
        )}
        {user && loading && (
          <div className="flex items-center justify-center h-full">
            <p className="font-mono text-sm text-gray-400">Loading…</p>
          </div>
        )}
        {user && !loading && feed.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 p-6 text-center">
            <p className="font-mono text-sm text-gray-400">No activity yet.</p>
            <p className="font-mono text-xs text-gray-300">
              Add friends to see their cafe likes here.
            </p>
          </div>
        )}
        {feed.map((entry) => (
          <div
            key={entry.id}
            className="flex items-start gap-3 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors"
          >
            <button
              onClick={() => router.push(`/profile/${entry.profile.username}`)}
              className="shrink-0 cursor-pointer"
            >
              <UserAvatar
                displayName={entry.profile.display_name}
                username={entry.profile.username}
                avatarUrl={entry.profile.avatar_url}
                size={36}
              />
            </button>
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-sm leading-5">
                <button
                  onClick={() =>
                    router.push(`/profile/${entry.profile.username}`)
                  }
                  className="font-bold hover:underline cursor-pointer"
                >
                  {entry.profile.display_name || entry.profile.username}
                </button>{" "}
                liked <span className="font-medium">{entry.cafe_name}</span>
              </p>
              <p className="text-xs font-mono text-gray-400">
                {timeAgo(entry.created_at)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
