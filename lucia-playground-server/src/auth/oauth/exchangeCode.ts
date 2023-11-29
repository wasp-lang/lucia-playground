import * as z from "zod";
import { Router } from "express";

import { auth } from "../../lucia.js";
import { getSessionForUserId } from "../utils.js";
import { validateRequest } from "zod-express";
import { tokenStore } from "./utils.js";

export function setupExchangeCode(router: Router) {
  router.post(
    "/exchange-code",
    validateRequest({
      body: z.object({
        code: z.coerce.string({
          required_error: "Code is required",
        }),
      }),
    }),
    async (req, res) => {
      const { code } = req.body;

      try {
        if (tokenStore.isUsed(code)) {
          return res.status(400).json({
            success: false,
            message: "Code already used",
          });
        }

        const { id: userId } = tokenStore.verifyToken(code);
        const user = await auth.getUser(userId);
        const session = await getSessionForUserId(user.userId);

        tokenStore.markUsed(code);

        return res.json({
          success: true,
          sessionId: session.sessionId,
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
