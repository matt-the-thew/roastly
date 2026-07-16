import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DropdownMenu from "@/components/DropdownMenu";

describe("DropdownMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the controlled value collapsed", () => {
    const onChange = vi.fn();
    render(<DropdownMenu value="Los Angeles" onChange={onChange} />);
    expect(screen.getByText("Los Angeles")).toBeDefined();
  });

  it("does not call onChange on mount", () => {
    const onChange = vi.fn();
    render(<DropdownMenu value="Los Angeles" onChange={onChange} />);
    // The component is controlled: it must not push its value upward until
    // the user actually picks a city. (Regression guard for the bug where a
    // remount reset selectedCity back to Los Angeles.)
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not show the other cities while collapsed", () => {
    const onChange = vi.fn();
    render(<DropdownMenu value="Los Angeles" onChange={onChange} />);
    expect(screen.queryByText("Seattle")).toBeNull();
    expect(screen.queryByText("Chicago")).toBeNull();
  });

  it("expands to show all other cities when clicked", () => {
    const onChange = vi.fn();
    render(<DropdownMenu value="Los Angeles" onChange={onChange} />);
    fireEvent.click(screen.getByText("Los Angeles"));

    expect(screen.getByText("New York")).toBeDefined();
    expect(screen.getByText("Chicago")).toBeDefined();
    expect(screen.getByText("Seattle")).toBeDefined();
    // the current value is not repeated as a selectable option
    expect(screen.queryAllByText("Los Angeles").length).toBe(1);
  });

  it("selecting a city calls onChange with the chosen value", () => {
    const onChange = vi.fn();
    render(<DropdownMenu value="Los Angeles" onChange={onChange} />);

    // open the menu
    fireEvent.click(screen.getByText("Los Angeles"));
    // choose a new city
    fireEvent.click(screen.getByText("Seattle"));

    expect(onChange).toHaveBeenCalledWith("Seattle");
  });

  it("reflects the controlled value it is given", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <DropdownMenu value="Los Angeles" onChange={onChange} />,
    );
    expect(screen.getByText("Los Angeles")).toBeDefined();

    // Parent-driven change is reflected without any internal state.
    rerender(<DropdownMenu value="Seattle" onChange={onChange} />);
    expect(screen.getByText("Seattle")).toBeDefined();
    expect(screen.queryByText("Los Angeles")).toBeNull();
  });
});
