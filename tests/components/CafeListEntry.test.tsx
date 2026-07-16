import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CafeListEntry from "@/components/CafeList/CafeListEntry";
import * as mapContext from "@/lib/MapContext";
import type { Location } from "@/lib/fetchLocations";

vi.mock("@/lib/MapContext", () => ({
  useMapContext: vi.fn(),
}));

const location: Location = {
  id: "cafe-1",
  description: "desc",
  is_verified: true,
  latitude: 34.05,
  longitude: -118.24,
  name: "Test Cafe",
  vibe: "cozy",
};

const setSelectedLocation = vi.fn();

function mockContext(userLocation: unknown = null) {
  (mapContext.useMapContext as ReturnType<typeof vi.fn>).mockReturnValue({
    setSelectedLocation,
    userLocation,
  });
}

describe("CafeListEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockContext();
  });

  it("renders the cafe title", () => {
    render(<CafeListEntry title="My Cafe" location={location} />);
    expect(screen.getByRole("heading", { name: "My Cafe" })).toBeDefined();
  });

  it("shows the passed description", () => {
    render(
      <CafeListEntry
        title="Cafe"
        description="A lovely spot"
        location={location}
      />,
    );
    expect(screen.getByText("A lovely spot")).toBeDefined();
  });

  it("shows a fallback prompt when no description is passed", () => {
    render(<CafeListEntry title="Cafe" location={location} />);
    expect(
      screen.getByText(/trouble finding this cafe's description/i),
    ).toBeDefined();
    expect(screen.getByText("Tell us about it.")).toBeDefined();
  });

  it("renders the rating when a rating is provided", () => {
    render(
      <CafeListEntry
        title="Cafe"
        rating={4}
        reviewCount={12}
        location={location}
      />,
    );
    // CafeListRating shows the review count in parentheses when rated
    expect(screen.getByText("(12)")).toBeDefined();
  });

  it("does not render the rating block when no rating is passed", () => {
    render(<CafeListEntry title="Cafe" location={location} />);
    expect(screen.queryByText("Not yet rated.")).toBeNull();
    expect(screen.queryByText(/^\(\d+\)$/)).toBeNull();
  });

  it("shows '?' distance when there is no user location", () => {
    mockContext(null);
    render(<CafeListEntry title="Cafe" location={location} />);
    expect(screen.getByText(/\?\s*mi/)).toBeDefined();
  });

  it("computes a numeric distance when a user location is present", () => {
    mockContext({ latitude: 34.06, longitude: -118.25 });
    render(<CafeListEntry title="Cafe" location={location} />);
    // haversine of these nearby points rounds to ~1 mi; assert non-'?' output
    expect(screen.queryByText(/\?\s*mi/)).toBeNull();
    expect(screen.getByText(/\d+\s*mi/)).toBeDefined();
  });

  it("selects the location when the info column is clicked", () => {
    render(<CafeListEntry title="Cafe" location={location} />);
    fireEvent.click(screen.getByRole("heading", { name: "Cafe" }));
    expect(setSelectedLocation).toHaveBeenCalledWith(location);
  });

  it("uses the placeholder image when no image prop is given", () => {
    render(<CafeListEntry title="Cafe" location={location} />);
    const img = screen.getByAltText(/cafe interior/i) as HTMLImageElement;
    expect(img.getAttribute("src")).toContain("placeholder-image");
  });

  it("uses the provided image when an image prop is given", () => {
    render(
      <CafeListEntry
        title="Cafe"
        image="/images/real-cafe.jpg"
        location={location}
      />,
    );
    const img = screen.getByAltText(/cafe interior/i) as HTMLImageElement;
    expect(img.getAttribute("src")).toContain("real-cafe");
  });
});
