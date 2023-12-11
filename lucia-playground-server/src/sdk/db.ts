import { prismaClient } from "../prisma.js";

export function createAuth(
  providerId: string,
  providerUserId: string,
  providerData: Record<string, any>
) {
  return prismaClient.auth.create({
    data: {
      identities: {
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

export function findAuthIdentity(providerId: string, providerUserId: string) {
  return prismaClient.authIdentity.findFirst({
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
  return prismaClient.authIdentity.updateMany({
    where: {
      providerId,
      providerUserId,
    },
    data: {
      providerData,
    },
  });
}

export async function findOrCreateAuthByAuthIdentity(
  providerName: string,
  providerUserId: string,
  providerData: Record<string, any>
) {
  const existingAuthIdentity = await findAuthIdentity(
    providerName,
    providerUserId
  );
  if (existingAuthIdentity) {
    return findAuth(existingAuthIdentity.authId);
  }
  const auth = await createAuth(providerName, providerUserId, providerData);
  return auth;
}
