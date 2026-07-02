import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import UserAvatar from "@/components/Social/UserAvatar";
import { getAvatarColor } from "@/lib/supabase/profile";

describe("UserAvatar", () => {
  it("renders an <img> with the avatar url and display name as alt when avatarUrl is present", () => {
    render(
      <UserAvatar
        displayName="John Doe"
        username="johnd"
        avatarUrl="https://example.com/pic.png"
      />,
    );
    const img = screen.getByRole("img", { name: "John Doe" });
    expect(img.tagName).toBe("IMG");
    // next/image may rewrite the src, but the original url should appear in it
    expect(img.getAttribute("src")).toContain(
      encodeURIComponent("https://example.com/pic.png"),
    );
    // no fallback initials div rendered
    expect(screen.queryByText("JD")).toBeNull();
  });

  it("falls back to the username as alt when displayName is empty (image branch)", () => {
    render(
      <UserAvatar
        displayName=""
        username="onlyuser"
        avatarUrl="https://example.com/x.png"
      />,
    );
    expect(screen.getByRole("img", { name: "onlyuser" })).toBeDefined();
  });

  it("renders initials + deterministic background color when avatarUrl is absent", () => {
    render(<UserAvatar displayName="Jane Roe" username="janer" />);
    const initials = screen.getByText("JR");
    expect(initials).toBeDefined();
    // no image rendered
    expect(screen.queryByRole("img")).toBeNull();
    // background color comes from getAvatarColor(username)
    expect(initials.style.backgroundColor).not.toBe("");
    // sanity: color matches the deterministic helper's output for this seed
    const expected = getAvatarColor("janer");
    // rgb string conversion — compare via a temporary element
    const probe = document.createElement("div");
    probe.style.backgroundColor = expected;
    expect(initials.style.backgroundColor).toBe(probe.style.backgroundColor);
  });

  it("falls back to username for initials when displayName is empty", () => {
    render(<UserAvatar displayName="" username="zoe" />);
    // getInitials("zoe") => "Z"
    expect(screen.getByText("Z")).toBeDefined();
  });

  it("applies the default size (32) to the fallback element", () => {
    render(<UserAvatar displayName="Al Bee" username="albee" />);
    const el = screen.getByText("AB");
    expect(el.style.width).toBe("32px");
    expect(el.style.height).toBe("32px");
    // fontSize is size * 0.35
    expect(el.style.fontSize).toBe(`${32 * 0.35}px`);
  });

  it("respects a custom size prop and merges className", () => {
    render(
      <UserAvatar
        displayName="Al Bee"
        username="albee"
        size={64}
        className="extra-class"
      />,
    );
    const el = screen.getByText("AB");
    expect(el.style.width).toBe("64px");
    expect(el.style.height).toBe("64px");
    expect(el.style.fontSize).toBe(`${64 * 0.35}px`);
    expect(el.className).toContain("extra-class");
  });
});
