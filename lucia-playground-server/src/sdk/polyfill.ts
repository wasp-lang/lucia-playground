import { webcrypto } from "node:crypto";

// NOTE: node < 19 doesn't have Crypto API, which we need for Lucia, so we apply the polyfill if Crypto API is not defined.
// @ts-ignore
if (typeof globalThis.crypto === "undefined") {
  // @ts-ignore
  globalThis.crypto = webcrypto as Crypto;
}
