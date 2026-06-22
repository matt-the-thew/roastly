"use client";
import Image from "next/image";
import Link from "next/link";
import { useMapContext } from "@/lib/MapContext";
import UserAvatar from "../Social/UserAvatar";
import { browserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CiLocationArrow1 } from "react-icons/ci";

export default function MapUserControls() {
  const { user, profile, feedVisible } = useMapContext();
  const router = useRouter();

  async function signOut() {
    const supabase = browserClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/");
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
      <div
        className="w-8 h-8 bg-background rounded-lg flex
        justify-center items-center hover:bg-primary cursor-pointer hover:text-white duration-200"
      >
        <CiLocationArrow1 className="w-[80%] h-[70%]" />
      </div>
    </div>
  );
}
