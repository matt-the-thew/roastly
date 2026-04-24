"use client";
import { useEffect, useState } from "react";
import { useMapContext } from "@/lib/MapContext";
import { getUserLike, getLikeCount, toggleLike } from "@/lib/supabase/likes";
import toast from "react-hot-toast";

interface Props {
  cafeId: string;
}

export default function LikeButton({ cafeId }: Props) {
  const { user, profile } = useMapContext();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getLikeCount(cafeId).then(setCount);
    if (user) getUserLike(user.id, cafeId).then(setLiked);
  }, [cafeId, user]);

  async function handleToggle() {
    if (!user || !profile) {
      toast.error("Sign in to like cafes");
      return;
    }
    setLoading(true);
    const nextLiked = !liked;
    // Optimistic update
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));
    try {
      await toggleLike(user.id, cafeId, liked);
    } catch {
      // Revert on failure
      setLiked(liked);
      setCount((c) => c + (nextLiked ? -1 : 1));
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border font-mono text-sm transition-colors duration-150 cursor-pointer
        ${liked
          ? "bg-primary border-primary text-white"
          : "border-gray-200 text-gray-500 hover:border-primary hover:text-primary"
        }
        disabled:opacity-50`}
    >
      <span className="text-base leading-none">{liked ? "♥" : "♡"}</span>
      <span>{count}</span>
    </button>
  );
}
