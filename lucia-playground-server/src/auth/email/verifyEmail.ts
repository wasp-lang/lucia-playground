import * as z from "zod";
import { Router } from "express";
import { validateRequest } from "zod-express";

import {
  verifyToken,
  findAuthIdentity,
  updateProviderData,
} from "../../sdk/index.js";

export function setupVerifyEmail(router: Router) {
  router.get(
    "/verify-email",
    validateRequest({
      query: z.object({
        token: z.string(),
      }),
    }),
    async (req, res) => {
      const { token } = req.query;
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

        await updateProviderData(
          authIdentity.providerId,
          authIdentity.providerUserId,
          {
            ...(authIdentity.providerData as any),
            emailVerificationSentAt: null,
            isEmailVerified: true,
          }
        );

        return res.status(200).json({
          success: true,
          message: "Email verified",
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
