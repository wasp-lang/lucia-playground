import { prismaClient } from "../prisma.js";

export function createAuth(
  providerId: string,
  providerUserId: string,
  providerData: Record<string, any>
) {
  return prismaClient.auth.create({
    data: {
      authProviders: {
        create: {
          providerId,
          providerUserId,
          // Can contain hashed password
          providerData,
        },
      },
      user: {
        create: {},
      },
    },
  });
}

export function findAuthProvider(providerId: string, providerUserId: string) {
  return prismaClient.authProvider.findFirst({
    where: {
      providerId,
      providerUserId,
    },
  });
}

export function findUser(userId: string) {
  return prismaClient.user.findUnique({
    where: {
      id: userId,
    },
  });
}

export function findAuth(authId: string) {
  return prismaClient.auth.findUnique({
    where: {
      id: authId,
    },
  });
}

export function deleteUser(userId: string) {
  return prismaClient.user.delete({
    where: {
      id: userId,
    },
  });
}

export function updateProviderData(
  providerId: string,
  providerUserId: string,
  providerData: Record<string, any>
) {
  return prismaClient.authProvider.updateMany({
    where: {
      providerId,
      providerUserId,
    },
    data: {
      providerData,
    },
  });
}
