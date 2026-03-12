import { test, expect } from "vitest";
import { screen } from "@testing-library/react";
import render from "./test_utils/render";
import Navbar from "@/ui/components/Navbar";

test("Shows sign in text", () => {
  render(<Navbar />);

  expect(screen.getByText("Sign In"));
});
