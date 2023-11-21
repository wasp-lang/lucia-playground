import * as z from "zod";
import { Router } from "express";
import { LuciaError } from "lucia";

import { auth } from "../../lucia.js";
import { validateRequest } from "zod-express";
import { createToken, sendEmail } from "./utils.js";
import { env } from "../../env.js";

export function setupRequestPasswordReset(router: Router) {
  router.post(
    "/request-password-reset",
    validateRequest({
      body: z.object({
        email: z.string().email({
          message: "Invalid email address",
        }),
      }),
    }),
    async (req, res) => {
      const { email } = req.body;

      try {
        const key = await auth.getKey("email", email.toLowerCase());
        const user = await auth.getUser(key.userId);

        await auth.updateUserAttributes(user.userId, {
          passwordResetSentAt: new Date(),
        });

        const token = createToken({
          email: key.providerUserId,
        });

        await sendEmail(
          `Reset your password at ${env.CLIENT_URL}/reset-password?token=${token}`
        );

        return res.status(200).json({
          success: true,
          message: "Password reset email sent",
        });
      } catch (e) {
        if (
          e instanceof LuciaError &&
          (e.message === "AUTH_INVALID_KEY_ID" ||
            e.message === "AUTH_INVALID_PASSWORD")
        ) {
          return res.status(400).json({
            success: false,
            message: "Incorrect email or password",
          });
        }

        return res.status(500).json({
          success: false,
          message: "Something went wrong",
        });
      }
    }
  );
}
