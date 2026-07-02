"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useMapContext } from "@/lib/MapContext";
import {
  getIncomingRequests,
  getFriends,
  sendFriendRequest,
  respondToRequest,
  type FriendshipWithProfile,
} from "@/lib/supabase/friends";
import { getProfileByFriendCode, type Profile } from "@/lib/supabase/profile";
import UserAvatar from "../Social/UserAvatar";
import { IoIosArrowBack } from "react-icons/io";
import { IoCheckmark, IoClose } from "react-icons/io5";
import toast from "react-hot-toast";

// Requests the user dismissed without accepting/denying stay hidden here
// (they're still pending server-side) until they act on them elsewhere.
function ignoredKey(userId: string) {
  return `roastly:ignoredFriendRequests:${userId}`;
}

function loadIgnored(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(ignoredKey(userId));
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveIgnored(userId: string, ids: Set<string>) {
  localStorage.setItem(ignoredKey(userId), JSON.stringify([...ids]));
}

export default function FriendsPanel() {
  const {
    user,
    profile,
    setOverlayView,
    refreshProfile,
    refreshFriendRequests,
  } = useMapContext();
  const [incoming, setIncoming] = useState<FriendshipWithProfile[]>([]);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [ignored, setIgnored] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [codeInput, setCodeInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setIgnored(loadIgnored(user.id));
    load();
  }, [user]);

  async function load() {
    if (!user) return;
    setLoading(true);
    const [req, fr] = await Promise.all([
      getIncomingRequests(user.id),
      getFriends(user.id),
    ]);
    setIncoming(req);
    setFriends(fr);
    setLoading(false);
  }

  async function handleAccept(req: FriendshipWithProfile) {
    try {
      await respondToRequest(req.id, "accepted");
      toast.success(
        `You're now friends with ${req.profiles.display_name || req.profiles.username}!`,
      );
      await Promise.all([load(), refreshFriendRequests(), refreshProfile()]);
    } catch {
      toast.error("Couldn't accept request.");
    }
  }

  async function handleDeny(req: FriendshipWithProfile) {
    try {
      await respondToRequest(req.id, "denied");
      await Promise.all([load(), refreshFriendRequests()]);
    } catch {
      toast.error("Couldn't deny request.");
    }
  }

  function handleIgnore(req: FriendshipWithProfile) {
    if (!user) return;
    const next = new Set(ignored);
    next.add(req.id);
    setIgnored(next);
    saveIgnored(user.id, next);
  }

  async function handleSendRequest() {
    if (!user || codeInput.length !== 7 || sending) return;
    setSending(true);
    try {
      const target = await getProfileByFriendCode(codeInput);
      if (!target) {
        toast.error("No profile found for that code.");
        return;
      }
      if (target.id === user.id) {
        toast.error("That's your own code.");
        return;
      }
      await sendFriendRequest(user.id, target.id);
      toast.success("Friend request sent!");
      setCodeInput("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't send request.");
    } finally {
      setSending(false);
    }
  }

  const visibleIncoming = incoming.filter((r) => !ignored.has(r.id));

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
          Friends
        </h2>
      </div>

      <div className="overflow-y-auto flex-1 flex flex-col gap-4 p-4">
        {profile && (
          <section className="flex flex-col gap-2">
            <h3 className="font-mono text-xs text-gray-500 uppercase tracking-wide">
              Your code
            </h3>
            <div className="flex items-center gap-3 border border-gray-200 rounded-md p-3">
              <span className="font-mono text-lg tracking-widest font-bold">
                {profile.friend_code.slice(0, 3)}-{profile.friend_code.slice(3)}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(profile.friend_code);
                  toast.success("Copied to clipboard");
                }}
                className="text-xs font-mono text-primary hover:underline cursor-pointer ml-auto"
              >
                Copy
              </button>
            </div>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <h3 className="font-mono text-xs text-gray-500 uppercase tracking-wide">
            Add a friend
          </h3>
          <div className="flex items-center gap-2">
            <input
              value={codeInput}
              onChange={(e) =>
                setCodeInput(
                  e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 7),
                )
              }
              onKeyDown={(e) => e.key === "Enter" && handleSendRequest()}
              placeholder="XXXXXXX"
              className="flex-1 p-2.5 bg-background border border-slate-300 rounded-md text-sm font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={handleSendRequest}
              disabled={codeInput.length !== 7 || sending}
              className="bg-primary text-white rounded-md px-3 py-2.5 text-xs font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-default"
            >
              Send
            </button>
          </div>
        </section>

        {visibleIncoming.length > 0 && (
          <section className="flex flex-col gap-2">
            <h3 className="font-mono text-xs text-gray-500 uppercase tracking-wide">
              Pending requests
            </h3>
            <div className="flex flex-col gap-2">
              {visibleIncoming.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-3 p-3 border border-gray-100 rounded-md"
                >
                  <UserAvatar
                    displayName={req.profiles.display_name}
                    username={req.profiles.username}
                    avatarUrl={req.profiles.avatar_url}
                    size={36}
                  />
                  <span className="text-sm font-medium truncate flex-1">
                    {req.profiles.display_name || req.profiles.username}
                  </span>
                  <button
                    onClick={() => handleAccept(req)}
                    aria-label="Accept"
                    className="w-7 h-7 shrink-0 rounded-full bg-primary text-white flex items-center justify-center hover:opacity-90 cursor-pointer"
                  >
                    <IoCheckmark className="text-sm" />
                  </button>
                  <button
                    onClick={() => handleDeny(req)}
                    aria-label="Deny"
                    className="w-7 h-7 shrink-0 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-red-100 hover:text-red-500 cursor-pointer"
                  >
                    <IoClose className="text-sm" />
                  </button>
                  <button
                    onClick={() => handleIgnore(req)}
                    className="text-[11px] font-mono text-gray-400 hover:text-gray-600 cursor-pointer shrink-0"
                  >
                    Ignore
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <h3 className="font-mono text-xs text-gray-500 uppercase tracking-wide">
            Friends {friends.length > 0 && `(${friends.length})`}
          </h3>
          {loading && (
            <p className="font-mono text-sm text-gray-400 text-center py-4">
              Loading…
            </p>
          )}
          {!loading && friends.length === 0 && (
            <p className="font-mono text-sm text-gray-400 text-center py-4">
              No friends yet. Share your code to get started.
            </p>
          )}
          <div className="flex flex-col gap-1">
            {friends.map((f) => (
              <Link
                key={f.id}
                href={`/profile/${f.username}`}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                <UserAvatar
                  displayName={f.display_name}
                  username={f.username}
                  avatarUrl={f.avatar_url}
                  size={32}
                />
                <span className="text-sm font-medium truncate">
                  {f.display_name || f.username}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
