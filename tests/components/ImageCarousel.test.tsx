import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ImageCarousel } from "@/components/ImageCarousel";

describe("ImageCarousel", () => {
  const imgs = ["/a.jpg", "/b.jpg", "/c.jpg"];

  it("renders an empty placeholder when no images are passed", () => {
    render(<ImageCarousel />);
    expect(screen.getByText("No photos yet")).toBeDefined();
  });

  it("renders an empty placeholder when images is an empty array", () => {
    render(<ImageCarousel images={[]} />);
    expect(screen.getByText("No photos yet")).toBeDefined();
  });

  it("renders the first image with an alt describing its position", () => {
    render(<ImageCarousel images={imgs} />);
    expect(screen.getByAltText("Cafe photo 1")).toBeDefined();
  });

  it("does not render navigation controls for a single image", () => {
    render(<ImageCarousel images={["/only.jpg"]} />);
    expect(screen.queryAllByRole("button").length).toBe(0);
  });

  it("renders prev/next buttons when there is more than one image", () => {
    render(<ImageCarousel images={imgs} />);
    expect(screen.getAllByRole("button").length).toBe(2);
  });

  it("disables the prev button on the first image", () => {
    render(<ImageCarousel images={imgs} />);
    const [prev, next] = screen.getAllByRole("button");
    expect((prev as HTMLButtonElement).disabled).toBe(true);
    expect((next as HTMLButtonElement).disabled).toBe(false);
  });

  it("advances to the next image when next is clicked", () => {
    render(<ImageCarousel images={imgs} />);
    const [, next] = screen.getAllByRole("button");
    fireEvent.click(next);
    expect(screen.getByAltText("Cafe photo 2")).toBeDefined();
  });

  it("disables the next button once on the last image", () => {
    render(<ImageCarousel images={imgs} />);
    const [, next] = screen.getAllByRole("button");
    fireEvent.click(next); // -> 2
    fireEvent.click(next); // -> 3 (last)
    expect(screen.getByAltText("Cafe photo 3")).toBeDefined();
    const [prev, nextAfter] = screen.getAllByRole("button");
    expect((nextAfter as HTMLButtonElement).disabled).toBe(true);
    expect((prev as HTMLButtonElement).disabled).toBe(false);
  });

  it("goes back to the previous image when prev is clicked", () => {
    render(<ImageCarousel images={imgs} />);
    const [prev, next] = screen.getAllByRole("button");
    fireEvent.click(next); // -> 2
    fireEvent.click(prev); // -> 1
    expect(screen.getByAltText("Cafe photo 1")).toBeDefined();
  });
});
