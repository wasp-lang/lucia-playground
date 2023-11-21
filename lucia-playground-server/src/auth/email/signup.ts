import * as z from "zod";
import { Prisma } from "@prisma/client";
import { Router } from "express";
import { LuciaError } from "lucia";

import { auth } from "../../lucia.js";
import { putUserInSession } from "../utils.js";
import { validateRequest } from "zod-express";
import {
  createToken,
  isEmailVerificationRequired,
  sendEmail,
} from "./utils.js";
import { env } from "../../env.js";

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

      if (isEmailVerificationRequired) {
        try {
          const key = await auth.getKey("email", email.toLowerCase());
          const user = await auth.getUser(key.userId);

          if (!user.isEmailVerified) {
            await auth.deleteUser(user.userId);
          }
        } catch (e) {
          const expectedError =
            e instanceof LuciaError && e.message === "AUTH_INVALID_KEY_ID";
          if (!expectedError) {
            console.error(e);
          }
        }
      }

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

        if (isEmailVerificationRequired) {
          const token = createToken({
            id: user.userId,
          });

          auth.updateUserAttributes(user.userId, {
            emailVerificationSentAt: new Date(),
          });

          await sendEmail(
            `Verify your email at ${env.SERVER_URL}/auth/verify-email?token=${token}`
          );

          return res.status(200).json({
            success: true,
            message: `Verify your email at ${env.SERVER_URL}/auth/verify-email?token=${token}`,
          });
        } else {
          await putUserInSession(user.userId, req, res);
          return res.status(200).json({
            success: true,
            message: "Signed up successfully",
          });
        }
      } catch (e) {
        if (
          (e instanceof Prisma.PrismaClientKnownRequestError &&
            e.code === "P2002") ||
          (e instanceof LuciaError && e.message === "AUTH_DUPLICATE_KEY_ID")
        ) {
          // return res.status(400).json({
          //   success: false,
          //   message: "Email already in use",
          // });
          return res.status(200).json({
            success: true,
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
