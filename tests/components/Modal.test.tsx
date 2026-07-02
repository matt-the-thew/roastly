import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Modal from "@/components/Modal";

describe("Modal", () => {
  it("renders nothing when isOpen is false (default)", () => {
    render(
      <Modal title="Hidden">
        <p>body content</p>
      </Modal>,
    );
    expect(screen.queryByText("Hidden")).toBeNull();
    expect(screen.queryByText("body content")).toBeNull();
  });

  it("renders nothing when isOpen is explicitly false", () => {
    render(
      <Modal title="Still hidden" isOpen={false}>
        <p>nope</p>
      </Modal>,
    );
    expect(screen.queryByText("Still hidden")).toBeNull();
  });

  it("renders the title when isOpen is true", () => {
    render(
      <Modal title="My Title" isOpen>
        <p>content</p>
      </Modal>,
    );
    const heading = screen.getByRole("heading", { name: "My Title" });
    expect(heading).toBeDefined();
  });

  it("renders its children when open", () => {
    render(
      <Modal title="Title" isOpen>
        <button>inner action</button>
      </Modal>,
    );
    expect(screen.getByRole("button", { name: "inner action" })).toBeDefined();
  });
});
