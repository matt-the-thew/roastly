import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DropdownMenu from "@/components/DropdownMenu";

describe("DropdownMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the default city collapsed and reports it via sendStateData", () => {
    const sendStateData = vi.fn();
    render(<DropdownMenu sendStateData={sendStateData} />);
    expect(screen.getByText("Los Angeles")).toBeDefined();
    // effect fires with the initial default city
    expect(sendStateData).toHaveBeenCalledWith("Los Angeles");
  });

  it("does not show the other cities while collapsed", () => {
    const sendStateData = vi.fn();
    render(<DropdownMenu sendStateData={sendStateData} />);
    expect(screen.queryByText("Seattle")).toBeNull();
    expect(screen.queryByText("Chicago")).toBeNull();
  });

  it("expands to show all other cities when clicked", () => {
    const sendStateData = vi.fn();
    render(<DropdownMenu sendStateData={sendStateData} />);
    fireEvent.click(screen.getByText("Los Angeles"));

    expect(screen.getByText("New York")).toBeDefined();
    expect(screen.getByText("Chicago")).toBeDefined();
    expect(screen.getByText("Seattle")).toBeDefined();
    // the current city is not repeated as a selectable option
    expect(screen.queryAllByText("Los Angeles").length).toBe(1);
  });

  it("selecting a city updates the current value and calls sendStateData", () => {
    const sendStateData = vi.fn();
    render(<DropdownMenu sendStateData={sendStateData} />);

    // open the menu
    fireEvent.click(screen.getByText("Los Angeles"));
    // choose a new city
    fireEvent.click(screen.getByText("Seattle"));

    expect(sendStateData).toHaveBeenCalledWith("Seattle");
    // after collapse, the selected city is displayed
    expect(screen.getByText("Seattle")).toBeDefined();
  });
});
