import { it, describe, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CafeListRating, {
  ratingImageGenerator,
} from "@/components/CafeList/CafeListRating";

type validateRatingImageTestType = {
  rating: number;
  numberFullCups: number;
  numberEmptyCups: number;
};

describe("Cafe rating", () => {
  describe("ratingImageGenerator", () => {
    it("returns full cup image correctly", () => {
      render(<div>{ratingImageGenerator(1, 2)}</div>);
      expect(screen.findByAltText("A full coffee cup")).toBeDefined();
    });
    it("returns empty cup image correctly", () => {
      render(<div>{ratingImageGenerator(2, 1)}</div>);
      expect(screen.findAllByAltText("An empty coffee cup")).toBeDefined();
    });
  });

  describe("CafeListRating component", () => {
    const emptyAltText = "An empty coffee cup";
    const fullAltText = "A full coffee cup";

    it.each([
      { rating: 1, numberFullCups: 1, numberEmptyCups: 4 },
      { rating: 2, numberFullCups: 2, numberEmptyCups: 3 },
      { rating: 3, numberFullCups: 3, numberEmptyCups: 2 },
      { rating: 4, numberFullCups: 4, numberEmptyCups: 1 },
    ])(
      "For a rating of $rating, show $numberFullCups full cups and $numberEmptyCups empty cups",
      ({
        rating,
        numberFullCups,
        numberEmptyCups,
      }: validateRatingImageTestType) => {
        render(<CafeListRating rating={rating} />);
        expect(screen.getAllByAltText(emptyAltText).length).toBe(
          numberEmptyCups,
        );
        expect(screen.getAllByAltText(fullAltText).length).toBe(numberFullCups);
      },
    );

    it("shows only full cups when rating is 5", () => {
      render(<CafeListRating rating={5} />);
      expect(screen.queryAllByAltText(emptyAltText).length).toBe(0);
      expect(screen.queryAllByAltText(fullAltText).length).toBe(5);
    });
    it("shows correct message when no rating exists", () => {
      render(<CafeListRating />);
      expect(screen.queryAllByDisplayValue("Not yet rated.")).toBeDefined();
      expect(screen.queryAllByDisplayValue("Rate this cafe.")).toBeDefined();
    });
  });
});
