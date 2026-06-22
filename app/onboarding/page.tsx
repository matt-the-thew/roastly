"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase/client";
import {
  createProfile,
  getProfile,
  isUsernameAvailable,
  getInitials,
  getAvatarColor,
} from "@/lib/supabase/profile";
import toast from "react-hot-toast";

export default function Onboarding() {
  const router = useRouter();
  const supabase = browserClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Redundant check for authorization, after proxy check on intial req
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/auth/login");
        return;
      }
      setUserId(data.user.id);
      // Pre-fill display name from Google metadata if present
      const name =
        data.user.user_metadata?.full_name ??
        data.user.user_metadata?.name ??
        "";
      setDisplayName(name);
    });
  }, []);

  async function checkUsername(value: string) {
    setUsername(value);
    setUsernameError("");
    if (value.length < 3) return;
    if (!/^[a-z0-9_]+$/.test(value)) {
      setUsernameError("Lowercase letters, numbers, and underscores only");
      return;
    }
    setChecking(true);
    const available = await isUsernameAvailable(value);
    setChecking(false);
    if (!available) setUsernameError("Username already taken");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!userId) return;
    if (usernameError || username.length < 3) {
      toast.error("Fix the username before continuing");
      return;
    }
    setSubmitting(true);
    try {
      await createProfile(userId, username, displayName || username, bio);
      toast.success("Profile created!");
      router.push("/dashboard/homepage");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const initials = getInitials(displayName || username || "?");
  const avatarColor = getAvatarColor(username || (userId ?? ""));

  return (
    <div className="w-screen h-screen flex justify-center items-start">
      <div className="w-120 mt-[15vh] rounded-2xl border border-gray-200 flex flex-col items-center p-10 gap-6">
        <Image
          src={"/branding/roastly-logo.svg"}
          alt="Roastly logo"
          width={145.891}
          height={49.594}
          className="w-40"
        />
        <h1 className="font-display text-2xl font-bold">
          Set up your profile
        </h1>

        {/* Avatar preview */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white select-none"
          style={{ backgroundColor: avatarColor }}
        >
          {`${initials}`}
        </div>
        <p className="text-xs text-gray-400 font-mono -mt-4">
          You can upload a real photo in Settings later.
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm font-mono text-gray-500">
              Display name
            </label>
            <input
              className="border border-gray-200 rounded-md p-2"
              type="text"
              placeholder="Jane Doe"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-mono text-gray-500">
              Username <span className="text-red-400">*</span>
            </label>
            <input
              className={`border rounded-md p-2 ${usernameError ? "border-red-400" : "border-gray-200"}`}
              type="text"
              placeholder="janedoe"
              value={username}
              onChange={(e) => checkUsername(e.target.value.toLowerCase())}
              maxLength={30}
              required
            />
            {checking && (
              <p className="text-xs text-gray-400 font-mono">Checking…</p>
            )}
            {usernameError && (
              <p className="text-xs text-red-400 font-mono">
                {usernameError}
              </p>
            )}
            {!usernameError && username.length >= 3 && !checking && (
              <p className="text-xs text-green-500 font-mono">
                Available!
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-mono text-gray-500">
              Bio (optional)
            </label>
            <textarea
              className="border border-gray-200 rounded-md p-2 resize-none h-20"
              placeholder="Personalize your bio here…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-gray-400 font-mono text-right">
              {bio.length}/200
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || !!usernameError || username.length < 3}
            className="bg-primary text-white rounded-md p-2 font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Creating profile…" : "Let's go →"}
          </button>
        </form>
      </div>
    </div>
  );
}
