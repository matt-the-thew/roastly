import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {},
      },
    },
  },
});

export const roastlySystem = createSystem(defaultConfig, config);
