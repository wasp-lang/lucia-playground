import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import jwt from "jsonwebtoken";

import { auth } from "../lucia.js";
import { env } from "../env.js";

export async function putUserInSession(
  userId: string,
  req: ExpressRequest,
  res: ExpressResponse
) {
  const session = await getSessionForUserId(userId);
  const authRequest = auth.handleRequest(req, res);
  authRequest.setSession(session);
}

export async function getSessionForUserId(userId: string) {
  return auth.createSession({
    userId,
    attributes: {},
  });
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
