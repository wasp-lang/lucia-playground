import { Lucia } from "lucia";
import { express } from "lucia/middleware";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { prismaClient } from "./prisma.js";

import { env } from "./env.js";

const prismaAdapter = new PrismaAdapter(
  prismaClient.session,
  prismaClient.auth
);

export const auth = new Lucia(prismaAdapter, {
  // Lucia validates the requests by checking if
  // * they came from same origin
  // * or they came form a whitelisted subdomain
  // "csrfProtection" must be "false" if you have different doamins for frontend and backend 🤷‍♂️
  csrfProtection: false,
  middleware: express(),
  sessionCookie: {
    name: "session",
    expires: true,
    attributes: {
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
    },
  },
  getUserAttributes: (databaseUserAttributes) => ({
    isEmailVerified: databaseUserAttributes.isEmailVerified,
    emailVerificationSentAt: databaseUserAttributes.emailVerificationSentAt,
    passwordResetSentAt: databaseUserAttributes.passwordResetSentAt,
  }),
});

declare module "lucia" {
  interface Register {
    Lucia: typeof auth;
    DatabaseUserAttributes: {
      isEmailVerified: boolean;
      emailVerificationSentAt?: Date;
      passwordResetSentAt?: Date;
    };
    DatabaseSessionAttributes: {};
  }
}
