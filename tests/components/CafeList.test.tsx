import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import CafeList from "@/components/CafeList/CafeList";
import * as mapContext from "@/lib/MapContext";
import type { Location } from "@/lib/fetchLocations";

vi.mock("@/lib/MapContext", () => ({
  useMapContext: vi.fn(),
}));

vi.mock("@/components/DropdownMenu", () => ({
  default: () => <div data-testid="dropdown" />,
}));

vi.mock("@/components/CafeList/CafeListEntry", () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="cafe-entry">{title}</div>
  ),
}));

const useMapContextMock = mapContext.useMapContext as ReturnType<typeof vi.fn>;
const setSelectedCity = vi.fn();
const setOverlayView = vi.fn();
const setSelectedLocation = vi.fn();

// Loose overrides: real cafe rows carry null description/vibe and the tests
// need to exercise those null branches, even though Location types them string.
function loc(overrides: Record<string, unknown>): Location {
  return {
    description: null,
    vibe: null,
    ...overrides,
  } as unknown as Location;
}

function setContext(locations: Location[]) {
  useMapContextMock.mockReturnValue({
    locations,
    setSelectedCity,
    setOverlayView,
    setSelectedLocation,
  });
}

const baseLocations: Location[] = [
  loc({ id: 1, name: "Blue Bottle", description: "cozy pour over", vibe: "calm" }),
  loc({ id: 2, name: "Stumptown", description: "roastery", vibe: "loud" }),
  loc({ id: 3, name: "Nullsville", description: null, vibe: null }),
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  setContext(baseLocations);
});

afterEach(() => {
  vi.useRealTimers();
});

function typeSearch(value: string) {
  const input = screen.getByPlaceholderText("Search cafes...");
  fireEvent.change(input, { target: { value } });
  return input;
}

describe("CafeList", () => {
  it("renders the available count and all cafes when the query is empty", () => {
    render(<CafeList />);
    expect(screen.getByText("3 cafes available")).toBeDefined();
    expect(screen.getAllByTestId("cafe-entry")).toHaveLength(3);
    // no debounced query -> no suggestions even on focus
    fireEvent.focus(screen.getByPlaceholderText("Search cafes..."));
    expect(screen.queryByText("Blue Bottle", { selector: "div.cursor-pointer" })).toBeNull();
  });

  it("filters by name after the debounce", async () => {
    render(<CafeList />);
    typeSearch("blue");
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    expect(screen.getByText("1 cafes available")).toBeDefined();
    expect(screen.getAllByTestId("cafe-entry")).toHaveLength(1);
  });

  it("matches on description and vibe, and treats null fields as empty", async () => {
    render(<CafeList />);
    // description match
    typeSearch("roastery");
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    expect(screen.getByText("1 cafes available")).toBeDefined();

    // vibe match
    typeSearch("calm");
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    expect(screen.getByText("1 cafes available")).toBeDefined();

    // query matching only the null-fields cafe by name (exercises ?? "" branch)
    typeSearch("nullsville");
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    expect(screen.getByText("1 cafes available")).toBeDefined();
  });

  it("opens suggestions on typing and caps them at MAX_SUGGESTIONS (6)", async () => {
    const many: Location[] = Array.from({ length: 8 }, (_, i) =>
      loc({ id: 100 + i, name: `Coffee ${i}`, description: null, vibe: null }),
    );
    setContext(many);
    render(<CafeList />);
    typeSearch("coffee");
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    const suggestionEls = screen
      .getAllByText(/^Coffee \d$/)
      .filter((el) => el.className.includes("cursor-pointer"));
    expect(suggestionEls).toHaveLength(6);
  });

  it("selecting a suggestion sets location, fills input, and closes suggestions", async () => {
    render(<CafeList />);
    const input = typeSearch("blue") as HTMLInputElement;
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    const suggestion = screen
      .getAllByText("Blue Bottle")
      .find((el) => el.className.includes("cursor-pointer"))!;
    fireEvent.click(suggestion);

    expect(setSelectedLocation).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Blue Bottle" }),
    );
    expect(input.value).toBe("Blue Bottle");
    // suggestion dropdown closed
    expect(
      screen
        .queryAllByText("Blue Bottle")
        .some((el) => el.className.includes("cursor-pointer")),
    ).toBe(false);
  });

  it("closes suggestions on outside click (document mousedown)", async () => {
    render(<CafeList />);
    typeSearch("blue");
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    expect(
      screen
        .getAllByText("Blue Bottle")
        .some((el) => el.className.includes("cursor-pointer")),
    ).toBe(true);

    await act(async () => {
      fireEvent.mouseDown(document.body);
    });
    expect(
      screen
        .queryAllByText("Blue Bottle")
        .some((el) => el.className.includes("cursor-pointer")),
    ).toBe(false);
  });

  it("keeps suggestions open when mousedown is inside the container", async () => {
    render(<CafeList />);
    const input = typeSearch("blue");
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    await act(async () => {
      fireEvent.mouseDown(input);
    });
    expect(
      screen
        .getAllByText("Blue Bottle")
        .some((el) => el.className.includes("cursor-pointer")),
    ).toBe(true);
  });

  it("suggest-an-addition button switches to the submission form", () => {
    render(<CafeList />);
    fireEvent.click(screen.getByText("suggest an addition"));
    expect(setOverlayView).toHaveBeenCalledWith("submissionForm");
  });
});
