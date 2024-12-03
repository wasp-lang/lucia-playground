import * as z from "zod";
import { Router } from "express";
import { validateRequest } from "zod-express";

import {
  createToken,
  createAuth,
  deleteUser,
  findAuth,
  findAuthIdentity,
  updateProviderData,
  hashPassword,
} from "../../index.js";
import { isEmailVerificationRequired, sendEmail } from "./utils.js";
import { env } from "../../env.js";

export function setupSignup(router: Router) {
  router.post(
    "/signup/email",
    validateRequest({
      body: z.object({
        email: z.string().email({
          message: "Invalid email address",
        }),
        password: z.string().min(8, {
          message: "Password must be at least 8 characters long",
        }),
      }),
    }),
    async (req, res) => {
      const { email, password } = req.body;

      if (isEmailVerificationRequired) {
        try {
          // const key = await auth.getKey("email", email.toLowerCase());
          const authIdentity = await findAuthIdentity(
            "email",
            email.toLowerCase()
          );

          if (!authIdentity) {
            throw new Error("User not found");
          }

          const auth = await findAuth(authIdentity.authId);

          if (!auth) {
            throw new Error("User not found");
          }

          if (!(authIdentity.providerData as any).isEmailVerified) {
            await deleteUser(auth.userId);
          }
        } catch (e) {
          // TODO: handle different errors
          console.error(e);
        }
      }

      try {
        const hashedPassword = await hashPassword(password);
        const auth = await createAuth("email", email.toLowerCase(), {
          hashedPassword,
        });

        if (isEmailVerificationRequired) {
          const token = createToken({
            email: email.toLowerCase(),
          });

          // TODO: is there a way to directly update the data without fetching it first?
          const authIdentity = await findAuthIdentity(
            "email",
            email.toLowerCase()
          );

          await updateProviderData("email", email.toLowerCase(), {
            ...(authIdentity?.providerData as any),
            emailVerificationSentAt: new Date(),
          });

          await sendEmail(
            `Verify your email at ${env.SERVER_URL}/auth/verify-email?token=${token}`
          );

          return res.status(200).json({
            success: true,
            message: `Verify your email at ${env.SERVER_URL}/auth/verify-email?token=${token}`,
          });
        } else {
          // await putUserInSession(auth.userId, req, res);
          return res.status(200).json({
            success: true,
            message: "Signed up successfully",
          });
        }
      } catch (e) {
        // TODO: handle different errors
        console.error(e);

        // console.error(e);

        return res.status(500).json({
          success: false,
          message: "Something went wrong",
        });
      }
    }
  );
}
