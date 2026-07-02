import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CafeSubmissionForm from "@/components/CafeList/CafeSubmissionForm";
import * as mapContext from "@/lib/MapContext";

vi.mock("@/lib/MapContext", () => ({
  useMapContext: vi.fn(),
}));

const setOverlayView = vi.fn();

describe("CafeSubmissionForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (mapContext.useMapContext as ReturnType<typeof vi.fn>).mockReturnValue({
      setOverlayView,
    });
  });

  it("renders the heading and intro copy", () => {
    render(<CafeSubmissionForm />);
    expect(screen.getByText("Cafe Submission Form")).toBeDefined();
    expect(
      screen.getByText(/Thanks for helping us improve our database/),
    ).toBeDefined();
  });

  it("renders all form field labels and placeholders", () => {
    render(<CafeSubmissionForm />);
    for (const label of ["Cafe Name", "Address", "Website", "Vibe"]) {
      expect(screen.getByText(label)).toBeDefined();
      expect(screen.getByPlaceholderText(label)).toBeDefined();
    }
    expect(screen.getByText("Why you love it")).toBeDefined();
    expect(screen.getByPlaceholderText("Tell us more...")).toBeDefined();
  });

  it("switches the overlay back to the cafe list when 'return' is clicked", () => {
    render(<CafeSubmissionForm />);
    fireEvent.click(screen.getByRole("button", { name: "return" }));
    expect(setOverlayView).toHaveBeenCalledTimes(1);
    expect(setOverlayView).toHaveBeenCalledWith("cafeList");
  });

  it("allows typing into the text inputs and textarea", () => {
    render(<CafeSubmissionForm />);
    const cafeName = screen.getByPlaceholderText("Cafe Name") as HTMLInputElement;
    fireEvent.change(cafeName, { target: { value: "Blue Bottle" } });
    expect(cafeName.value).toBe("Blue Bottle");

    const why = screen.getByPlaceholderText(
      "Tell us more...",
    ) as HTMLTextAreaElement;
    fireEvent.change(why, { target: { value: "Great espresso" } });
    expect(why.value).toBe("Great espresso");
  });
});
