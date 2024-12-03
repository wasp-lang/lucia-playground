import jwt from "jsonwebtoken";

import { env } from "./env.js";

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
