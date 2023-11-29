import * as z from "zod";
import { Router } from "express";

import { getSessionForAuthId } from "../utils.js";
import { validateRequest } from "zod-express";
import { isEmailVerificationRequired } from "./utils.js";
import { findAuthProvider } from "../db.js";
import { verifyPassword } from "../passwords.js";

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

        const hashedPassword = (authProvider.providerData as any)
          .hashedPassword;
        const passwordMatches = await verifyPassword({
          hash: hashedPassword,
          password,
        });

        if (!passwordMatches) {
          return res.status(400).json({
            success: false,
            message: "Incorrect email or password",
          });
        }

        if (
          isEmailVerificationRequired &&
          !(authProvider.providerData as any).isEmailVerified
        ) {
          return res.status(400).json({
            success: false,
            message: "Incorrect email or password",
          });
        } else {
          // await putUserInSession(key.userId, req, res);

          const session = await getSessionForAuthId(authProvider.authId);

          return res.json({
            success: true,
            sessionId: session.id,
          });
        }
      } catch (e) {
        // TODO: handle different errors
        console.error(e);

        return res.status(500).json({
          success: false,
          message: "Something went wrong",
        });
      }
    }
  );
}
