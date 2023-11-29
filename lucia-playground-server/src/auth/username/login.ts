import * as z from "zod";
import { Router } from "express";

import { getSessionForAuthId } from "../utils.js";
import { validateRequest } from "zod-express";
import { findAuthProvider } from "../db.js";
import { verifyPassword } from "../passwords.js";

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
        const usernameAuthProvider = await findAuthProvider(
          "username",
          username.toLowerCase()
        );
        if (!usernameAuthProvider) {
          return res.status(401).json({
            success: false,
            message: "Invalid username or password",
          });
        }

        const hashedPassword = (usernameAuthProvider.providerData as any)
          .hashedPassword;

        if (!hashedPassword) {
          return res.status(500).json({
            success: false,
            message: "Something went wrong",
          });
        }

        const passwordMatches = await verifyPassword({
          hash: hashedPassword,
          password,
        });

        if (!passwordMatches) {
          return res.status(401).json({
            success: false,
            message: "Invalid username or password",
          });
        }

        const session = await getSessionForAuthId(usernameAuthProvider.authId);

        return res.json({
          success: true,
          sessionId: session.id,
        });
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
