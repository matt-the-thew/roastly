"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { browserClient } from "@/lib/supabase/client";
import {
  getProfileByUsername,
  getInitials,
  getAvatarColor,
  type Profile,
} from "@/lib/supabase/profile";
import {
  getFriendship,
  getFriends,
  getMutualFriends,
  sendFriendRequest,
  respondToRequest,
  removeFriend,
} from "@/lib/supabase/friends";
import { getUserLikedCafeIds } from "@/lib/supabase/likes";
import { fetchLocations, type Location } from "@/lib/fetchLocations";
import type { Friendship } from "@/lib/supabase/friends";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();

  const [viewerProfile, setViewerProfile] = useState<Profile | null>(null);
  const [targetProfile, setTargetProfile] = useState<Profile | null>(null);
  const [friendship, setFriendship] = useState<Friendship | null>(null);
  const [mutualFriends, setMutualFriends] = useState<Profile[]>([]);
  const [friendCount, setFriendCount] = useState(0);
  const [likedCafes, setLikedCafes] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSelf, setIsSelf] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [allLocations, setAllLocations] = useState<Location[]>([]);

  const isFriend = friendship?.status === "accepted";
  const canViewFull = isSelf || isFriend || !targetProfile?.is_private;

  useEffect(() => {
    async function load() {
      const supabase = browserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const [target, locations] = await Promise.all([
        getProfileByUsername(username),
        fetchLocations(),
      ]);
      setAllLocations(locations);

      if (!target) {
        setLoading(false);
        return;
      }
      setTargetProfile(target);

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: viewerData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setViewerProfile(viewerData ?? null);

      const self = user.id === target.id;
      setIsSelf(self);

      if (!self) {
        const [fs, mutual, friends] = await Promise.all([
          getFriendship(user.id, target.id),
          getMutualFriends(user.id, target.id),
          getFriends(target.id),
        ]);
        setFriendship(fs);
        setMutualFriends(mutual);
        setFriendCount(friends.length);
      } else {
        const friends = await getFriends(target.id);
        setFriendCount(friends.length);
      }

      // Load liked cafes if viewer can see full profile
      const canSee =
        self || friendship?.status === "accepted" || !target.is_private;
      if (canSee) {
        const ids = await getUserLikedCafeIds(target.id);
        //TODO: clean up id/name primary key complexity on cafe table, and cafe_list_view
        setLikedCafes(locations.filter((l) => ids.includes(l.name)));
      }

      setLoading(false);
    }
    load();
  }, [username]);

  async function handleAddFriend() {
    if (!viewerProfile || !targetProfile) return;
    setSendingRequest(true);
    try {
      await sendFriendRequest(viewerProfile.id, targetProfile.id);
      const updated = await getFriendship(viewerProfile.id, targetProfile.id);
      setFriendship(updated);
      toast.success("Friend request sent!");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Could not send request",
      );
    } finally {
      setSendingRequest(false);
    }
  }

  async function handleUnfriend() {
    if (!viewerProfile || !targetProfile) return;
    if (!confirm(`Remove ${targetProfile.display_name} as a friend?`)) return;
    await removeFriend(viewerProfile.id, targetProfile.id);
    setFriendship(null);
    toast.success("Friend removed");
  }

  async function handleRespondToRequest(response: "accepted" | "denied") {
    if (!friendship) return;
    await respondToRequest(friendship.id, response);
    const updated = await getFriendship(viewerProfile!.id, targetProfile!.id);
    setFriendship(updated);
    if (response === "accepted") toast.success("You're now friends!");
  }

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="font-mono text-gray-400">Loading…</p>
      </div>
    );
  }

  if (!targetProfile) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="font-mono text-gray-400">User not found.</p>
      </div>
    );
  }

  const initials = getInitials(
    targetProfile.display_name || targetProfile.username,
  );
  const avatarColor = getAvatarColor(targetProfile.username);

  // Viewer received a request from target
  const pendingFromTarget =
    !isSelf &&
    friendship?.status === "pending" &&
    friendship.addressee_id === viewerProfile?.id;
  // Viewer sent a request to target
  const pendingToTarget =
    !isSelf &&
    friendship?.status === "pending" &&
    friendship.requester_id === viewerProfile?.id;

  return (
    <div className="w-screen min-h-screen flex justify-center py-16">
      <div className="w-120 flex flex-col gap-8">
        <button
          onClick={() => router.back()}
          className="text-sm font-mono text-gray-400 hover:text-foreground w-fit"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="flex items-center gap-5">
          {targetProfile.avatar_url ? (
            <Image
              src={targetProfile.avatar_url}
              alt=""
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-2xl font-bold">
              {targetProfile.display_name || targetProfile.username}
            </h1>
            <p className="font-mono text-sm text-gray-400">
              @{targetProfile.username}
            </p>
            {canViewFull && (
              <p className="font-mono text-sm text-gray-500">
                {friendCount} friends
              </p>
            )}
          </div>
          {/* Action buttons */}
          <div className="ml-auto flex flex-col gap-2">
            {isSelf && (
              <button
                onClick={() => router.push("/settings")}
                className="border border-gray-200 rounded-md px-4 py-1.5 text-sm font-mono hover:bg-gray-50 cursor-pointer"
              >
                Edit profile
              </button>
            )}
            {!isSelf && !friendship && viewerProfile && (
              <button
                onClick={handleAddFriend}
                disabled={sendingRequest}
                className="bg-primary text-white rounded-md px-4 py-1.5 text-sm font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                {sendingRequest ? "Sending…" : "Add friend"}
              </button>
            )}
            {pendingToTarget && (
              <span className="text-sm font-mono text-gray-400 italic">
                Request pending…
              </span>
            )}
            {pendingFromTarget && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleRespondToRequest("accepted")}
                  className="bg-primary text-white rounded-md px-3 py-1.5 text-sm font-bold cursor-pointer hover:opacity-90"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRespondToRequest("denied")}
                  className="border border-gray-200 rounded-md px-3 py-1.5 text-sm font-mono cursor-pointer hover:bg-gray-50"
                >
                  Ignore
                </button>
              </div>
            )}
            {isFriend && !isSelf && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/homepage?message=${targetProfile.id}`,
                    )
                  }
                  className="bg-primary text-white rounded-md px-3 py-1.5 text-sm font-mono cursor-pointer hover:opacity-90"
                >
                  Message
                </button>
                <button
                  onClick={handleUnfriend}
                  className="text-sm font-mono text-red-400 hover:underline cursor-pointer"
                >
                  Unfriend
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Private wall for non-friends */}
        {!canViewFull ? (
          <div className="border border-gray-200 rounded-xl p-8 flex flex-col items-center gap-3 text-center">
            <p className="font-mono text-gray-400">This account is private.</p>
            <p className="text-sm font-mono text-gray-300">
              Add {targetProfile.username} as a friend to see their profile.
            </p>
          </div>
        ) : (
          <>
            {/* Bio */}
            {targetProfile.bio && (
              <p className="text-[0.95rem] leading-7 text-gray-600">
                {targetProfile.bio}
              </p>
            )}

            {/* Mutual friends */}
            {!isSelf && mutualFriends.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="font-mono text-sm text-gray-500 uppercase tracking-wide">
                  {mutualFriends.length} mutual friend
                  {mutualFriends.length !== 1 ? "s" : ""}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {mutualFriends.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => router.push(`/profile/${f.username}`)}
                      className="flex items-center gap-2 border border-gray-200 rounded-full px-3 py-1.5 text-sm font-mono hover:bg-gray-50 cursor-pointer"
                    >
                      {f.avatar_url ? (
                        <Image
                          src={f.avatar_url}
                          alt=""
                          width={20}
                          height={20}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[0.6rem] font-bold text-white"
                          style={{
                            backgroundColor: getAvatarColor(f.username),
                          }}
                        >
                          {getInitials(f.display_name || f.username)}
                        </div>
                      )}
                      {f.display_name || f.username}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Liked cafes */}
            <section className="flex flex-col gap-3">
              <h2 className="font-mono text-sm text-gray-500 uppercase tracking-wide">
                Liked cafes ({likedCafes.length})
              </h2>
              {likedCafes.length === 0 ? (
                <p className="text-sm font-mono text-gray-400">No likes yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {likedCafes.map((cafe) => (
                    <div
                      key={cafe.name}
                      className="border border-gray-200 rounded-xl p-4 flex flex-col gap-1"
                    >
                      <p className="font-bold">{cafe.name}</p>
                      <p className="text-sm text-gray-500 leading-6 line-clamp-2">
                        {cafe.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
