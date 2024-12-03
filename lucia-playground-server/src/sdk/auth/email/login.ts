import * as z from "zod";
import { validateRequest } from "zod-express";
import { Router } from "express";

import {
  createSessionForAuthId,
  findAuthIdentity,
  verifyPassword,
} from "../../index.js";
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
        const authIdentity = await findAuthIdentity(
          "email",
          email.toLowerCase()
        );

        if (!authIdentity) {
          return res.status(400).json({
            success: false,
            message: "Incorrect email or password",
          });
        }

        const hashedPassword = (authIdentity.providerData as any)
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
          !(authIdentity.providerData as any).isEmailVerified
        ) {
          return res.status(400).json({
            success: false,
            message: "Incorrect email or password",
          });
        } else {
          // await putUserInSession(key.userId, req, res);

          const session = await createSessionForAuthId(authIdentity.authId);

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
