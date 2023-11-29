import * as z from "zod";
import { Router } from "express";

import { auth } from "../../lucia.js";
import { validateRequest } from "zod-express";
import { verifyToken } from "../utils.js";

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
        const { id } = verifyToken<{ id: string }>(token);

        await auth.updateUserAttributes(id, {
          isEmailVerified: true,
        });

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
