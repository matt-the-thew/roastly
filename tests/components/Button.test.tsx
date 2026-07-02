import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "@/components/Button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeDefined();
  });

  it("renders a button element", () => {
    render(<Button>Label</Button>);
    expect(screen.getByRole("button")).toBeDefined();
  });

  it("invokes clickEvent when clicked", () => {
    const onClick = vi.fn();
    render(<Button clickEvent={onClick}>Go</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not throw when clicked without a handler", () => {
    render(<Button>NoHandler</Button>);
    expect(() =>
      fireEvent.click(screen.getByRole("button")),
    ).not.toThrow();
  });

  it("applies standard variant styling by default", () => {
    render(<Button>Standard</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-primary");
    expect(button.className).toContain("hover:bg-accent");
  });

  it("applies ghost variant styling when variant is ghost", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-transparent");
    expect(button.className).toContain("hover:bg-slate-300");
  });

  it("sets the text color for the ghost variant", () => {
    render(<Button variant="ghost">Ghost text</Button>);
    const text = screen.getByText("Ghost text");
    expect(text.className).toContain("text-black");
  });
});
