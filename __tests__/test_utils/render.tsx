import { ChakraProvider } from "@chakra-ui/react";
import { render as rtlRender } from "@testing-library/react";
import { roastlySystem } from "@/ui/theme";

export default function render(ui: React.ReactNode) {
  return rtlRender(<>{ui}</>, {
    wrapper: (props: React.PropsWithChildren) => (
      <ChakraProvider value={roastlySystem}>{props.children}</ChakraProvider>
    ),
  });
}
