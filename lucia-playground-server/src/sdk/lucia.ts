import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { prismaClient } from "../prisma.js";

import { env } from "../env.js";

const prismaAdapter = new PrismaAdapter(
  prismaClient.session,
  prismaClient.auth
);

// TODO: figure out CSRF protection in Lucia - https://v3.lucia-auth.com/guides/validate-session-cookies/express/
export const auth = new Lucia(prismaAdapter, {
  sessionCookie: {
    name: "session",
    expires: true,
    attributes: {
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
    },
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof auth;
    DatabaseSessionAttributes: {};
  }
}
