import * as z from "zod";
import { Router } from "express";
import { LuciaError } from "lucia";

import { auth } from "../../lucia.js";
import { getSessionForUserId } from "../utils.js";
import { validateRequest } from "zod-express";

export function setupLogin(router: Router) {
  router.post(
    "/login/username",
    validateRequest({
      body: z.object({
        username: z.string({
          required_error: "Username is required",
        }),
        password: z.string(),
      }),
    }),
    async (req, res) => {
      const { username, password } = req.body;

      try {
        const key = await auth.useKey(
          "username",
          username.toLowerCase(),
          password
        );

        const session = await getSessionForUserId(key.userId);

        return res.json({
          success: true,
          sessionId: session.sessionId,
        });
      } catch (e) {
        if (
          e instanceof LuciaError &&
          (e.message === "AUTH_INVALID_KEY_ID" ||
            e.message === "AUTH_INVALID_PASSWORD")
        ) {
          return res.status(400).json({
            success: false,
            message: "Incorrect username or password",
          });
        }

        return res.status(500).json({
          success: false,
          message: "Something went wrong",
        });
      }
    }
  );
}
