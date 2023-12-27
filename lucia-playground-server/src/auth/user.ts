import { Router } from "express";

import { prismaClient } from "../prisma.js";
import { AuthIdentity } from "@prisma/client";
import { getSessionFromBearerToken } from "../sdk/index.js";

export function setupCurrentUser(router: Router) {
  router.get("/user", async (req, res) => {
    const { session, user } = await getSessionFromBearerToken(req);

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
            identities: true,
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
      businessLogicUser.auth.identities = scrubAuthIdentityData(
        businessLogicUser.auth.identities
      );
    }

    return res.status(200).json(businessLogicUser);
  });
}

function scrubAuthIdentityData(identities: AuthIdentity[]) {
  return identities.map((identity) => {
    // If providerData contains hashedPassword, remove it

    const providerData = identity.providerData as any;
    if (providerData.hashedPassword) {
      delete providerData.hashedPassword;
    }

    return identity;
  });
}
