import * as z from "zod";
import { Router } from "express";

import { auth } from "../../lucia.js";
import { validateRequest } from "zod-express";
import { verifyToken } from "../utils.js";
import { findAuthProvider, updateProviderData } from "../db.js";
import { hashPassword } from "../passwords.js";

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

        const hashedPassword = await hashPassword(password);

        await updateProviderData(
          authProvider.providerId,
          authProvider.providerUserId,
          {
            ...(authProvider.providerData as any),
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
