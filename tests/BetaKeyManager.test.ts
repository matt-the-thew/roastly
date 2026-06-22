import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();

// vi.hoisted(() => {
//   vi.mock("@supabase/supabase-js", () => {
//     return {
//       createClient: vi.fn(() => {
//         from: mockFrom.mockReturnValue({
//           select: mockSelect.mockReturnValue({
//             eq: mockEq,
//           }),
//         });
//       }),
//     };
//   });
// });

import { BetaKeyManager } from "@/app/actions/BetaKeyManager";

describe("BetaKeyManager", async () => {
  const keyManager = new BetaKeyManager();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("pulls environment secrets successfully", async () => {
    expect(keyManager.REDEMPTION_SECRET).toBeDefined();
  });
});
