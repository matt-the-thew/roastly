import Image from "next/image";
import { getInitials, getAvatarColor } from "@/lib/supabase/profile";

interface Props {
  displayName: string;
  username: string;
  avatarUrl?: string;
  size?: number;
  className?: string;
}

export default function UserAvatar({ displayName, username, avatarUrl, size = 32, className = "" }: Props) {
  const initials = getInitials(displayName || username);
  const color = getAvatarColor(username);

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={displayName || username}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white select-none ${className}`}
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}
