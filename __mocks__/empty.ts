// Empty stub used to satisfy Next.js runtime-guard imports ("server-only" /
// "client-only") when modules are pulled into the Vitest (jsdom) environment.
// These packages intentionally throw when imported outside their target
// bundle; aliasing them here lets us unit-test server-action and client code
// without the guard tripping. See vitest.config.mts `resolve.alias`.
export {};
