import * as z from "zod";
import { Router } from "express";
import { LuciaError } from "lucia";

import { auth } from "../../lucia.js";
import { getSessionForUserId } from "../utils.js";
import { validateRequest } from "zod-express";
import { isEmailVerificationRequired } from "./utils.js";

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
        const user = await auth.getUser(key.userId);

        if (isEmailVerificationRequired && !user.isEmailVerified) {
          return res.status(400).json({
            success: false,
            message: "Incorrect email or password",
          });
        } else {
          // await putUserInSession(key.userId, req, res);

          const session = await getSessionForUserId(user.userId);

          // NOTE: this might be a deal breaker for us, since we need to redirect to a different domain
          return res.json({
            success: true,
            sessionId: session.sessionId,
          });
        }
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
