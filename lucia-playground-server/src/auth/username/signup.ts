import * as z from "zod";
import { Router } from "express";

import { validateRequest } from "zod-express";
import { createAuth } from "../db.js";
import { hashPassword } from "../passwords.js";

export function setupSignup(router: Router) {
  router.post(
    "/signup/username",
    validateRequest({
      body: z.object({
        username: z.string({
          required_error: "Username is required",
        }),
        password: z.string().min(8, {
          message: "Password must be at least 8 characters long",
        }),
      }),
    }),
    async (req, res) => {
      const { username, password } = req.body;

      try {
        const hashedPassword = await hashPassword(password);
        const auth = await createAuth("username", username.toLowerCase(), {
          hashedPassword,
        });

        return res.status(200).json({
          success: true,
          message: "Signed up successfully",
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
