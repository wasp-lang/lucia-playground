import * as z from "zod";
import { Router } from "express";

import { validateRequest } from "zod-express";
import { verifyToken } from "../utils.js";
import { findAuthProvider, updateProviderData } from "../db.js";

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
