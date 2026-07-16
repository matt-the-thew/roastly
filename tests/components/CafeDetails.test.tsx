import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import CafeDetails from "@/components/CafeList/CafeDetails";
import * as mapContext from "@/lib/MapContext";
import * as images from "@/lib/supabase/images";

vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/lib/MapContext", () => ({
  useMapContext: vi.fn(),
}));

vi.mock("@/lib/supabase/images", () => ({
  getCafeImages: vi.fn(),
  getPublicUrl: vi.fn(),
}));

// isolate child components that have their own data dependencies
vi.mock("@/components/CafeList/LikeButton", () => ({
  default: ({ cafeId }: { cafeId: string }) => (
    <div data-testid="like-button">{cafeId}</div>
  ),
}));

vi.mock("@/components/Social/FriendAttribution", () => ({
  default: ({ cafeId }: { cafeId: string }) => (
    <div data-testid="friend-attribution">{cafeId}</div>
  ),
}));

const setOverlayView = vi.fn();
const setSelectedLocation = vi.fn();

const selectedLocation = {
  id: "cafe-1",
  description: "A cozy neighborhood cafe",
  is_verified: true,
  latitude: 34,
  longitude: -118,
  name: "The Roastery",
  vibe: "cozy",
};

function mockContext(location: unknown) {
  (mapContext.useMapContext as ReturnType<typeof vi.fn>).mockReturnValue({
    selectedLocation: location,
    setOverlayView,
    setSelectedLocation,
  });
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("CafeDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (images.getCafeImages as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (images.getPublicUrl as ReturnType<typeof vi.fn>).mockImplementation(
      (p: string) => `https://cdn/${p}`,
    );
  });

  it("renders nothing when there is no selected location", () => {
    mockContext(null);
    const { container } = render(<CafeDetails />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the cafe name and description for a selected location", async () => {
    mockContext(selectedLocation);
    render(<CafeDetails />);
    await flush();
    expect(screen.getByRole("heading", { name: "The Roastery" })).toBeDefined();
    expect(screen.getByText("A cozy neighborhood cafe")).toBeDefined();
    expect(screen.getByText("About")).toBeDefined();
  });

  it("passes the cafe id to LikeButton and FriendAttribution", async () => {
    mockContext(selectedLocation);
    render(<CafeDetails />);
    await flush();
    expect(screen.getByTestId("like-button").textContent).toBe("cafe-1");
    expect(screen.getByTestId("friend-attribution").textContent).toBe("cafe-1");
  });

  it("fetches images for the selected cafe", async () => {
    mockContext(selectedLocation);
    render(<CafeDetails />);
    await flush();
    expect(images.getCafeImages).toHaveBeenCalledWith("cafe-1");
  });

  it("returns to the cafe list and clears selection when return is clicked", async () => {
    mockContext(selectedLocation);
    render(<CafeDetails />);
    await flush();
    fireEvent.click(screen.getByRole("button", { name: "return" }));
    expect(setOverlayView).toHaveBeenCalledWith("cafeList");
    expect(setSelectedLocation).toHaveBeenCalledWith(null);
  });

  it("shows the carousel empty state when no images are returned", async () => {
    mockContext(selectedLocation);
    render(<CafeDetails />);
    await flush();
    expect(screen.getByText("No photos yet")).toBeDefined();
  });

  it("resolves storage paths to public urls for each returned image", async () => {
    mockContext(selectedLocation);
    (images.getCafeImages as ReturnType<typeof vi.fn>).mockResolvedValue([
      { storage_path: "cafe-1/a.jpg" },
      { storage_path: "cafe-1/b.jpg" },
    ]);
    render(<CafeDetails />);
    await flush();
    // the map callback must run per image, invoking getPublicUrl on each path
    expect(images.getPublicUrl).toHaveBeenCalledWith("cafe-1/a.jpg");
    expect(images.getPublicUrl).toHaveBeenCalledWith("cafe-1/b.jpg");
  });
});
