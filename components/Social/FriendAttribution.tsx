"use client";
import { useEffect, useState } from "react";
import { useMapContext } from "@/lib/MapContext";
import { getLikersForCafe, type LikeWithProfile } from "@/lib/supabase/likes";
import UserAvatar from "./UserAvatar";
import { useRouter } from "next/navigation";

interface Props {
  cafeId: string;
}

export default function FriendAttribution({ cafeId }: Props) {
  const { friendIds } = useMapContext();
  const [friendLikers, setFriendLikers] = useState<LikeWithProfile[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (friendIds.size === 0) return;
    getLikersForCafe(cafeId).then((likers) => {
      const friends = likers.filter((l) => friendIds.has(l.user_id));
      setFriendLikers(friends);
    });
  }, [cafeId, friendIds]);

  if (friendLikers.length === 0) return null;

  const shown = friendLikers.slice(0, 3);
  const extra = friendLikers.length - shown.length;

  const names = shown.map(
    (l) => l.profiles.display_name || l.profiles.username,
  );
  let label = "";
  if (names.length === 1) {
    label =
      extra > 0
        ? `${names[0]} and ${extra} other${extra > 1 ? "s" : ""} liked this`
        : `${names[0]} liked this`;
  } else if (names.length === 2) {
    label =
      extra > 0
        ? `${names[0]}, ${names[1]} and ${extra} other${extra > 1 ? "s" : ""} liked this`
        : `${names[0]} and ${names[1]} liked this`;
  } else {
    label = `${names[0]}, ${names[1]}, ${names[2]}${extra > 0 ? ` and ${extra} more` : ""} liked this`;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-1.5">
        {shown.map((l) => (
          <button
            key={l.user_id}
            onClick={() => router.push(`/profile/${l.profiles.username}`)}
            className="cursor-pointer ring-2 ring-background rounded-full"
          >
            <UserAvatar
              displayName={l.profiles.display_name}
              username={l.profiles.username}
              avatarUrl={l.profiles.avatar_url}
              size={24}
            />
          </button>
        ))}
      </div>
      <p className="text-xs font-mono text-gray-500">{label}</p>
    </div>
  );
}
