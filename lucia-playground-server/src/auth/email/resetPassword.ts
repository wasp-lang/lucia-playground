import * as z from "zod";
import { Router } from "express";

import { auth } from "../../lucia.js";
import { validateRequest } from "zod-express";
import { verifyToken } from "../utils.js";

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

        const key = await auth.updateKeyPassword("email", email, password);

        await auth.updateUserAttributes(key.userId, {
          isEmailVerified: true,
          passwordResetSentAt: null,
        });

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
