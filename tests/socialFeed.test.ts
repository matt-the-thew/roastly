import { describe, it, expect } from "vitest";

// Mirrors the timeAgo logic in SocialFeed.tsx
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

describe("timeAgo", () => {
  it("returns 'just now' for sub-minute timestamps", () => {
    const recent = new Date(Date.now() - 30_000).toISOString();
    expect(timeAgo(recent)).toBe("just now");
  });

  it("returns minutes for timestamps under an hour", () => {
    const ago = new Date(Date.now() - 15 * 60_000).toISOString();
    expect(timeAgo(ago)).toBe("15m ago");
  });

  it("returns hours for timestamps under a day", () => {
    const ago = new Date(Date.now() - 3 * 3600_000).toISOString();
    expect(timeAgo(ago)).toBe("3h ago");
  });

  it("returns days for timestamps over a day", () => {
    const ago = new Date(Date.now() - 2 * 86400_000).toISOString();
    expect(timeAgo(ago)).toBe("2d ago");
  });
});
