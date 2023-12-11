import * as z from "zod";
import { Router } from "express";
import { validateRequest } from "zod-express";

import { getSessionForAuthId, tokenStore, findAuth } from "../../sdk/index.js";

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

        const { id: authId } = tokenStore.verifyToken(code);
        const auth = await findAuth(authId);

        if (!auth) {
          return res.status(400).json({
            success: false,
            message: "Invalid code",
          });
        }

        const session = await getSessionForAuthId(auth.id);

        tokenStore.markUsed(code);

        return res.json({
          success: true,
          sessionId: session.id,
        });
      } catch (e) {
        console.error(e);

        return res.status(500).json({
          success: false,
          message: "Something went wrong",
        });
      }
    }
  );
}
