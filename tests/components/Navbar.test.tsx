import { it, expect, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import Navbar from "@/components/Navbar";

describe("Navbar", () => {
  it("should display the Navbar component", () => {
    render(<Navbar />);
  });
});
