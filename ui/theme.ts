import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import { buttonRecipe } from "./recipes/button";

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: "'Martian Mono', monospace" },
        body: { value: "'Martian Mono', monospace" },
      },
      colors: {
        primary: { value: "#FDD998" },
        hover: { value: "#ac7435" },
        secondary: { value: "#975102" },
      },
    },

    recipes: {
      button: buttonRecipe,
    },
  },
});

export const roastlySystem = createSystem(defaultConfig, config);
