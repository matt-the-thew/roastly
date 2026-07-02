"use client";
import { useEffect, useRef, useState } from "react";
import { useMapContext } from "@/lib/MapContext";
import { getUserLike, toggleLike } from "@/lib/supabase/likes";
import { debounce } from "@/lib/debounce";
import toast from "react-hot-toast";

const LIKE_WRITE_DEBOUNCE_MS = 400;

interface Props {
  cafeId: string;
}

export default function LikeButton({ cafeId }: Props) {
  const { user, profile, likeCounts, adjustLikeCount } = useMapContext();
  const [liked, setLiked] = useState(false);
  const count = likeCounts[cafeId] ?? 0;

  // Last value confirmed against the DB; updated after each successful write.
  const serverLikedRef = useRef(false);
  // Most recent desired state from the user's latest click, read when the
  // debounced sync finally fires.
  const pendingLikedRef = useRef(false);
  const userRef = useRef(user);
  userRef.current = user;

  useEffect(() => {
    if (!user) return;
    getUserLike(user.id, cafeId).then((isLiked) => {
      serverLikedRef.current = isLiked;
      pendingLikedRef.current = isLiked;
      setLiked(isLiked);
    });
  }, [cafeId, user]);

  const debouncedSyncRef = useRef(
    debounce((id: string) => {
      const u = userRef.current;
      if (!u) return;
      const baseline = serverLikedRef.current;
      const desired = pendingLikedRef.current;
      if (baseline === desired) return; // net no-op within the debounce window
      toggleLike(u.id, id, baseline)
        .then(() => {
          serverLikedRef.current = desired;
        })
        .catch(() => {
          setLiked(baseline);
          adjustLikeCount(id, baseline ? 1 : -1);
          toast.error("Something went wrong");
        });
    }, LIKE_WRITE_DEBOUNCE_MS),
  );

  function handleToggle() {
    if (!user || !profile) {
      toast.error("Sign in to like cafes");
      return;
    }
    const nextLiked = !liked;
    setLiked(nextLiked);
    pendingLikedRef.current = nextLiked;
    adjustLikeCount(cafeId, nextLiked ? 1 : -1);
    debouncedSyncRef.current(cafeId);
  }

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border font-mono text-sm transition-colors duration-150 cursor-pointer
        ${liked
          ? "bg-primary border-primary text-white"
          : "border-gray-200 text-gray-500 hover:border-primary hover:text-primary"
        }`}
    >
      <span className="text-base leading-none">{liked ? "♥" : "♡"}</span>
      <span>{count}</span>
    </button>
  );
}
