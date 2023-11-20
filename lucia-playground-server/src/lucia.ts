import { lucia } from "lucia";
import { express } from "lucia/middleware";
import { prisma } from "@lucia-auth/adapter-prisma";
import { prismaClient } from "./prisma.js";

// If you’re using Node.js version 18 or below, you need to polyfill
// the Web Crypto API. This is not required if you’re using Node.js v20
// and above.
import "lucia/polyfill/node";

export const auth = lucia({
  env: "DEV",
  // Lucia validates the requests by checking if
  // * they came from same origin
  // * or they came form a whitelisted subdomain
  // "csrfProtection" must be "false" if you have different doamins for frontend and backend 🤷‍♂️
  csrfProtection: false,
  middleware: express(),
  adapter: prisma(prismaClient, {
    user: "auth",
    session: "session",
    key: "key",
  }),
});

export type Auth = typeof auth;
