import { Request as ExpressRequest } from "express";
import jwt from "jsonwebtoken";

import { auth } from "./lucia.js";
import { env } from "../env.js";

export async function getSessionForAuthId(authId: string) {
  return auth.createSession(authId, {});
}

const { sign, verify } = jwt;

const secret = env.JWT_SECRET;

export function createToken<Payload extends {}>(
  payload: Payload,
  expiresIn: number | string = "1d"
) {
  return sign(payload, secret, {
    expiresIn,
  });
}

export function verifyToken<Payload extends {}>(token: string) {
  return verify(token, secret, {
    complete: false,
  }) as Payload;
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
