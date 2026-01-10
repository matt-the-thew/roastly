import { defineRecipe } from "@chakra-ui/react";

export const buttonRecipe = defineRecipe({
  base: {
    fontWeight: "500",
    borderRadius: "md",
    transition: "all 0.2s",
  },

  variants: {
    variant: {
      solid: {
        bg: "secondary",
        color: "white",
        _hover: {
          bg: "hover",
        },
        "&:active": {
          bg: "primary",
        },
      },

      ghost: {
        bg: "transparent",
        color: "black",
        _hover: {
          bg: "white",
        },
        "&:active": {
          bg: "primary",
        },
      },
    },
  },
});
