import { Router } from "express";

import { prismaClient } from "../prisma.js";
import { auth } from "../lucia.js";

export function setupCurrentUser(router: Router) {
  router.get("/user", async (req, res) => {
    const authRequest = auth.handleRequest(req, res);
    const session = await authRequest.validate(); // or `authRequest.validateBearerToken()`
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const user = session.user;

    const businessLogicUser = await prismaClient.user.findFirst({
      where: {
        auth: {
          id: user.userId,
        },
      },
    });

    if (!businessLogicUser) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }

    return res.status(200).json({
      success: true,
      user,
      businessLogicUser,
    });
  });
}
