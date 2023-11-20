import * as z from "zod";
import { Prisma } from "@prisma/client";
import { Router } from "express";
import { LuciaError } from "lucia";

import { auth } from "../../lucia.js";
import { putUserInSession } from "../utils.js";
import { validateRequest } from "zod-express";

export function setupSignup(router: Router) {
  router.post(
    "/signup/email",
    validateRequest({
      body: z.object({
        email: z.string().email({
          message: "Invalid email address",
        }),
        password: z.string().min(8, {
          message: "Password must be at least 8 characters long",
        }),
      }),
    }),
    async (req, res) => {
      const { email, password } = req.body;

      try {
        const user = await auth.createUser({
          key: {
            providerId: "email", // auth method
            providerUserId: email.toLowerCase(), // unique id when using "username" auth method
            password, // hashed by Lucia
          },
          attributes: {
            user: {
              create: {},
            },
          },
        });

        await putUserInSession(user.userId, req, res);

        return res.status(200).json({
          success: true,
        });
      } catch (e) {
        if (
          (e instanceof Prisma.PrismaClientKnownRequestError &&
            e.code === "P2002") ||
          (e instanceof LuciaError && e.message === "AUTH_DUPLICATE_KEY_ID")
        ) {
          return res.status(400).json({
            success: false,
            message: "Email already in use",
          });
        }

        console.error(e);

        return res.status(500).json({
          success: false,
          message: "Something went wrong",
        });
      }
    }
  );
}
