import { Router } from "express";

import { prismaClient } from "../prisma.js";
import { AuthProvider } from "@prisma/client";
import { auth } from "../lucia.js";

export function setupCurrentUser(router: Router) {
  router.get("/user", async (req, res) => {
    const authRequest = auth.handleRequest(req, res);
    const { session, user } = await authRequest.validateBearerToken();
    if (!session || !user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const businessLogicUser = await prismaClient.user.findFirst({
      where: {
        auth: {
          id: user.id,
        },
      },
      include: {
        auth: {
          include: {
            authProviders: true,
          },
        },
      },
    });

    if (!businessLogicUser) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }

    if (businessLogicUser.auth) {
      businessLogicUser.auth.authProviders = scrubAuthProviderData(
        businessLogicUser.auth.authProviders
      );
    }

    return res.status(200).json(businessLogicUser);
  });
}

function scrubAuthProviderData(authProviders: AuthProvider[]) {
  return authProviders.map((authProvider) => {
    // If providerData contains hashedPassword, remove it

    const providerData = authProvider.providerData as any;
    if (providerData.hashedPassword) {
      delete providerData.hashedPassword;
    }

    return authProvider;
  });
}
