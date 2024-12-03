import * as z from "zod";
import { Router } from "express";
import { validateRequest } from "zod-express";

import {
  verifyToken,
  findAuthIdentity,
  updateProviderData,
  hashPassword,
} from "../../index.js";

export function setupResetPassword(router: Router) {
  router.post(
    "/reset-password",
    validateRequest({
      body: z.object({
        password: z.string().min(8, {
          message: "Password must be at least 8 characters long",
        }),
        token: z.string(),
      }),
    }),
    async (req, res) => {
      const { password, token } = req.body;
      try {
        const { email } = verifyToken<{ email: string }>(token);

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

        const hashedPassword = await hashPassword(password);

        await updateProviderData(
          authIdentity.providerId,
          authIdentity.providerUserId,
          {
            ...(authIdentity.providerData as any),
            hashedPassword,
            isEmailVerified: true,
            passwordResetSentAt: null,
          }
        );

        return res.status(200).json({
          success: true,
          message: "Password successfully reset",
        });
      } catch (e) {
        return res.status(500).json({
          success: false,
          message: "Something went wrong",
        });
      }
    }
  );
}
