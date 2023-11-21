import { type Prisma } from "@prisma/client";
/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = import("./src/lucia.js").Auth;
  type DatabaseUserAttributes = {
    isEmailVerified: boolean;
    emailVerificationSentAt?: Date;
    passwordResetSentAt?: Date;
    user: {
      create: Prisma.UserCreateInput;
    };
  };
  type DatabaseSessionAttributes = {};
}
