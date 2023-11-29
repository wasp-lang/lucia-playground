import * as z from "zod";
import { Router } from "express";

import { validateRequest } from "zod-express";
import { sendEmail } from "./utils.js";
import { env } from "../../env.js";
import { createToken } from "../utils.js";
import { findAuthProvider, updateProviderData } from "../db.js";

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
        // const key = await auth.getKey("email", email.toLowerCase());
        // const user = await auth.getUser(key.userId);

        const authProvider = await findAuthProvider(
          "email",
          email.toLowerCase()
        );

        if (!authProvider) {
          return res.status(400).json({
            success: false,
            message: "Incorrect email or password",
          });
        }

        await updateProviderData(
          authProvider.providerId,
          authProvider.providerUserId,
          {
            ...(authProvider.providerData as any),
            passwordResetSentAt: new Date(),
          }
        );

        const token = createToken({
          email: authProvider.providerUserId,
        });

        await sendEmail(
          `Reset your password at ${env.CLIENT_URL}/?token=${token}`
        );

        return res.status(200).json({
          success: true,
          message: `Reset your password at ${env.CLIENT_URL}/?token=${token}`,
        });
      } catch (e) {
        // TODO: handle different errors
        console.error(e);

        return res.status(500).json({
          success: false,
          message: "Something went wrong",
        });
      }
    }
  );
}
