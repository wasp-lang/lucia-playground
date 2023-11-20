import * as z from "zod";
import { Router } from "express";
import { LuciaError } from "lucia";

import { auth } from "../../lucia.js";
import { putUserInSession } from "../utils.js";
import { validateRequest } from "zod-express";

export function setupLogin(router: Router) {
  router.post(
    "/login/email",
    validateRequest({
      body: z.object({
        email: z.string().email({
          message: "Invalid email address",
        }),
        password: z.string(),
      }),
    }),
    async (req, res) => {
      const { email, password } = req.body;

      try {
        const key = await auth.useKey("email", email.toLowerCase(), password);

        await putUserInSession(key.userId, req, res);

        return res.status(200).json({
          success: true,
        });
      } catch (e) {
        if (
          e instanceof LuciaError &&
          (e.message === "AUTH_INVALID_KEY_ID" ||
            e.message === "AUTH_INVALID_PASSWORD")
        ) {
          return res.status(400).json({
            success: false,
            message: "Incorrect email or password",
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
