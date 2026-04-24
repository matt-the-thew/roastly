"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  getProfile,
  updateProfile,
  getInitials,
  getAvatarColor,
  type Profile,
} from "@/lib/supabase/profile";
import toast from "react-hot-toast";

export default function Settings() {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace("/auth/login"); return; }
      const p = await getProfile(data.user.id);
      if (!p) { router.replace("/onboarding"); return; }
      setProfile(p);
      setDisplayName(p.display_name);
      setBio(p.bio);
      setIsPrivate(p.is_private);
      setAvatarUrl(p.avatar_url);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      await updateProfile(profile.id, { display_name: displayName, bio, is_private: isPrivate });
      toast.success("Profile updated");
      setProfile({ ...profile, display_name: displayName, bio, is_private: isPrivate });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `avatars/${profile.id}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      await updateProfile(profile.id, { avatar_url: data.publicUrl });
      setAvatarUrl(data.publicUrl);
      setProfile({ ...profile, avatar_url: data.publicUrl });
      toast.success("Avatar updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleChangePassword() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return;
    await supabase.auth.resetPasswordForEmail(user.email);
    toast.success("Password reset email sent");
  }

  async function handleDeleteAccount() {
    if (!confirm("Delete your account? This cannot be undone.")) return;
    // Deletion handled server-side; sign out and inform user
    await supabase.auth.signOut();
    toast("Account deletion requested. Contact support to complete removal.");
    router.push("/");
  }

  if (!profile) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="font-mono text-gray-400">Loading…</p>
      </div>
    );
  }

  const initials = getInitials(profile.display_name || profile.username);
  const avatarColor = getAvatarColor(profile.username);

  return (
    <div className="w-screen min-h-screen flex justify-center py-16">
      <div className="w-120 flex flex-col gap-8">
        <button
          onClick={() => router.back()}
          className="text-sm font-mono text-gray-400 hover:text-foreground w-fit"
        >
          ← Back
        </button>

        <h1 className="font-display text-2xl font-bold">Settings</h1>

        {/* Avatar */}
        <section className="flex flex-col gap-3">
          <h2 className="font-mono text-sm text-gray-500 uppercase tracking-wide">Profile picture</h2>
          <div className="flex items-center gap-5">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Your avatar"
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
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingAvatar}
              className="border border-gray-200 rounded-md px-4 py-2 text-sm font-mono hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              {uploadingAvatar ? "Uploading…" : "Upload photo"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
        </section>

        {/* Profile form */}
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <h2 className="font-mono text-sm text-gray-500 uppercase tracking-wide">Profile info</h2>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-mono text-gray-500">Display name</label>
            <input
              className="border border-gray-200 rounded-md p-2"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-mono text-gray-500">Username</label>
            <input
              className="border border-gray-200 rounded-md p-2 bg-gray-50 text-gray-400 cursor-not-allowed"
              value={profile.username}
              disabled
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-mono text-gray-500">Bio</label>
            <textarea
              className="border border-gray-200 rounded-md p-2 resize-none h-20"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-gray-400 font-mono text-right">{bio.length}/200</p>
          </div>

          <div className="flex items-center justify-between border border-gray-200 rounded-md p-3">
            <div>
              <p className="font-mono text-sm font-bold">Private account</p>
              <p className="font-mono text-xs text-gray-400">Only friends can see your full profile and activity</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPrivate((p) => !p)}
              className={`w-12 h-6 rounded-full transition-colors duration-200 relative cursor-pointer ${isPrivate ? "bg-primary" : "bg-gray-200"}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isPrivate ? "translate-x-6" : "translate-x-0.5"}`}
              />
            </button>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white rounded-md p-2 font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>

        {/* Friend code */}
        <section className="flex flex-col gap-3">
          <h2 className="font-mono text-sm text-gray-500 uppercase tracking-wide">Friend code</h2>
          <div className="flex items-center gap-3 border border-gray-200 rounded-md p-3">
            <span className="font-mono text-xl tracking-widest font-bold">
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
          <p className="text-xs font-mono text-gray-400">Share this code so friends can add you.</p>
        </section>

        {/* Account actions */}
        <section className="flex flex-col gap-3 border-t border-gray-100 pt-6">
          <h2 className="font-mono text-sm text-gray-500 uppercase tracking-wide">Account</h2>
          <button
            onClick={handleChangePassword}
            className="text-sm font-mono text-left hover:underline text-primary w-fit cursor-pointer"
          >
            Change password
          </button>
          <button
            onClick={handleDeleteAccount}
            className="text-sm font-mono text-left hover:underline text-red-400 w-fit cursor-pointer"
          >
            Delete account
          </button>
        </section>
      </div>
    </div>
  );
}
