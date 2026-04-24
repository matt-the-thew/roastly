"use client";
import { useState, useEffect } from "react";
import { getLikeCount, getLikersForCafe, type LikeWithProfile } from "@/lib/supabase/likes";
import UserAvatar from "./UserAvatar";

interface Props {
  cafeId: string;
  cafeName: string;
  friendIds: string[];
}

export default function MarkerContent({ cafeId, cafeName, friendIds }: Props) {
  const [hovered, setHovered] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [friendLikers, setFriendLikers] = useState<LikeWithProfile[]>([]);

  useEffect(() => {
    getLikeCount(cafeId).then(setLikeCount);
  }, [cafeId]);

  useEffect(() => {
    if (!hovered || friendIds.length === 0) return;
    getLikersForCafe(cafeId).then((likers) => {
      setFriendLikers(likers.filter((l) => friendIds.includes(l.user_id)).slice(0, 3));
    });
  }, [hovered, cafeId, friendIds]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Marker dot */}
      <div className="w-5 h-5 bg-primary rounded-4xl flex items-center justify-center cursor-pointer hover:bg-amber-500 border border-black">
        <div className="bg-background w-2 h-2 z-2 rounded-2xl" />
      </div>

      {/* Hover popup */}
      {hovered && (
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 bg-background border border-gray-200 rounded-xl shadow-lg p-3 flex flex-col gap-1.5 min-w-35 z-50 pointer-events-none">
          <p className="font-bold text-sm whitespace-nowrap">{cafeName}</p>
          <div className="flex items-center gap-2">
            <span className="text-primary text-sm">♥</span>
            <span className="font-mono text-xs text-gray-500">{likeCount}</span>
            {friendLikers.length > 0 && (
              <div className="flex -space-x-1 ml-1">
                {friendLikers.map((l) => (
                  <UserAvatar
                    key={l.user_id}
                    displayName={l.profiles.display_name}
                    username={l.profiles.username}
                    avatarUrl={l.profiles.avatar_url}
                    size={18}
                    className="ring-1 ring-background"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
