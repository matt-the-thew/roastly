import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CafeTagList from "@/components/CafeList/CafeTagList";

describe("CafeTagList", () => {
  it("renders the tag items", () => {
    render(<CafeTagList />);
    // several tags repeat in the markup; assert at least the labels exist
    expect(screen.getAllByText("work-friendly").length).toBeGreaterThan(0);
    expect(screen.getAllByText("teas").length).toBeGreaterThan(0);
    expect(screen.getAllByText("artsy").length).toBeGreaterThan(0);
  });

  it("renders as collapsed initially (down arrow container present)", () => {
    const { container } = render(<CafeTagList />);
    const collapsible = container.querySelector(".duration-500");
    expect(collapsible?.className).toContain("h-15");
    expect(collapsible?.className).toContain("overflow-hidden");
  });

  it("expands when clicked, switching to the extended layout", () => {
    const { container } = render(<CafeTagList />);
    const collapsible = container.querySelector(".duration-500") as HTMLElement;
    fireEvent.click(collapsible);
    expect(collapsible.className).toContain("h-fit");
    expect(collapsible.className).not.toContain("overflow-hidden");
  });

  it("toggles back to collapsed on a second click", () => {
    const { container } = render(<CafeTagList />);
    const collapsible = container.querySelector(".duration-500") as HTMLElement;
    fireEvent.click(collapsible); // expand
    fireEvent.click(collapsible); // collapse
    expect(collapsible.className).toContain("h-15");
    expect(collapsible.className).toContain("overflow-hidden");
  });
});
