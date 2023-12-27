import { Request as ExpressRequest } from "express";

import { auth } from "./lucia.js";

export async function createSessionForAuthId(authId: string) {
  return auth.createSession(authId, {});
}

export async function getSessionFromBearerToken(req: ExpressRequest) {
  const authorizationHeader = req.headers["authorization"];

  if (typeof authorizationHeader !== "string") {
    return {
      user: null,
      session: null,
    };
  }

  const sessionId = auth.readBearerToken(authorizationHeader ?? "");
  if (!sessionId) {
    return {
      user: null,
      session: null,
    };
  }

  return auth.validateSession(sessionId);
}

export function invalidateSession(sessionId: string) {
  return auth.invalidateSession(sessionId);
}
