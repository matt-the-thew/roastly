"use client";
import Image from "next/image";
import Link from "next/link";
import { useMapContext } from "@/lib/MapContext";
import UserAvatar from "../Social/UserAvatar";
import { browserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CiLocationArrow1 } from "react-icons/ci";
import { IoChatbubbleEllipsesOutline, IoPeopleOutline } from "react-icons/io5";

export default function MapUserControls() {
  const {
    user,
    profile,
    feedVisible,
    triggerGeolocate,
    unreadTotal,
    openMessages,
    pendingRequestCount,
    openFriends,
  } = useMapContext();
  const router = useRouter();

  async function signOut() {
    const supabase = browserClient();
    try {
      // `local` scope skips the network revoke that can hang or throw when the
      // session is already invalid — the button must always sign the user out
      // and navigate, even from a broken session. This also fires SIGNED_OUT so
      // MapContext resets `user`/`profile` immediately.
      await supabase.auth.signOut({ scope: "local" });
    } catch (err) {
      console.error("[signOut]:", err);
    } finally {
      // Belt-and-suspenders: clear any server-written cookie chunks the browser
      // client can't see or match on its own.
      await fetch("/api/auth/sign-out", { method: "POST" }).catch(() => {});
      toast.success("Signed out");
      router.push("/");
      // Drop the cached RSC/router state tied to the old session so nothing
      // authed lingers after navigating.
      router.refresh();
    }
  }

  return (
    <div
      className={`fixed ${feedVisible ? "right-96" : "right-4"} top-2 z-10 flex items-center gap-3 transition-[right] duration-300`}
    >
      <Link href={"/"}>
        <Image
          src={"/branding/roastly-logo.svg"}
          alt="Roastly logo"
          width={145.891}
          height={49.594}
          className="w-45 hover:opacity-80"
        />
      </Link>

      {user && profile ? (
        <div className="flex items-center gap-2 bg-background rounded-xl px-3 py-1.5 border border-gray-100">
          <Link href={`/profile/${profile.username}`}>
            <UserAvatar
              displayName={profile.display_name}
              username={profile.username}
              avatarUrl={profile.avatar_url}
              size={28}
              className="hover:opacity-80"
            />
          </Link>
          <button
            onClick={openMessages}
            className="relative text-gray-500 hover:text-foreground cursor-pointer"
            aria-label="Messages"
          >
            <IoChatbubbleEllipsesOutline className="text-lg" />
            {unreadTotal > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[10px] font-mono flex items-center justify-center">
                {unreadTotal > 9 ? "9+" : unreadTotal}
              </span>
            )}
          </button>
          <button
            onClick={openFriends}
            className="relative text-gray-500 hover:text-foreground cursor-pointer"
            aria-label="Friends"
          >
            <IoPeopleOutline className="text-lg" />
            {pendingRequestCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[10px] font-mono flex items-center justify-center">
                {pendingRequestCount > 9 ? "9+" : pendingRequestCount}
              </span>
            )}
          </button>
          <Link
            href="/settings"
            className="text-xs font-mono text-gray-500 hover:text-foreground"
          >
            Settings
          </Link>
          <button
            onClick={signOut}
            className="text-xs font-mono text-gray-400 hover:text-red-400 cursor-pointer"
          >
            Sign out
          </button>
        </div>
      ) : (
        <Link
          href="/auth/login"
          className="bg-background border border-gray-200 rounded-xl
          px-3 py-1.5 text-xs font-mono hover:bg-primary
          hover:text-white transition-colors"
        >
          Sign in
        </Link>
      )}
      <button
        onClick={triggerGeolocate}
        className="w-8 h-8 bg-background rounded-lg flex
        justify-center items-center hover:bg-primary cursor-pointer hover:text-white duration-200"
      >
        <CiLocationArrow1 className="w-[80%] h-[70%]" />
      </button>
    </div>
  );
}
