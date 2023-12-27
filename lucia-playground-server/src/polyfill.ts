import { webcrypto } from "node:crypto";

// @ts-ignore
globalThis.crypto = webcrypto as Crypto;
