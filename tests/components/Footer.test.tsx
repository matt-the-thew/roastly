import { it, describe, expect, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

describe("Footer", () => {
  beforeAll(() => {
    render(<Footer />);
  });

  it("should display the component", () => {
    expect(screen.getByTestId("footer")).toBeDefined();
  });

  it("should display the Roastly logo", () => {
    expect(screen.queryByAltText("Roastly logo")).toBeDefined();
  });

  it("should display the Company and Store headers", () => {
    expect(screen.queryAllByText("Company")).toBeDefined();
    expect(screen.queryAllByText("Store")).toBeDefined();
  });
});
