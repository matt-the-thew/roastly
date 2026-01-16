import { LogLayer, ConsoleTransport } from "loglayer";
import { serializeError } from "serialize-error";

export const log = new LogLayer({
  errorSerializer: serializeError,
  transport: new ConsoleTransport({
    logger: console,
  }),
  prefix: "[RoastlyDev]:",
});
