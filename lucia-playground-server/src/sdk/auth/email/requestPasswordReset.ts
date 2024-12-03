import * as z from "zod";
import { Router } from "express";

import { validateRequest } from "zod-express";
import { sendEmail } from "./utils.js";
import { env } from "../../env.js";
import {
  createToken,
  findAuthIdentity,
  updateProviderData,
} from "../../index.js";

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

        const authIdentity = await findAuthIdentity(
          "email",
          email.toLowerCase()
        );

        if (!authIdentity) {
          return res.status(400).json({
            success: false,
            message: "Incorrect email or password",
          });
        }

        await updateProviderData(
          authIdentity.providerId,
          authIdentity.providerUserId,
          {
            ...(authIdentity.providerData as any),
            passwordResetSentAt: new Date(),
          }
        );

        const token = createToken({
          email: authIdentity.providerUserId,
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
