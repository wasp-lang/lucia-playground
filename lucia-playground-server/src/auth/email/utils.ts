import jwt from "jsonwebtoken";
import { env } from "../../env.js";

const { sign, verify } = jwt;

export const isEmailVerificationRequired = true;

const secret = env.JWT_SECRET;

export function createToken<Payload extends {}>(payload: Payload) {
  return sign(payload, secret, {
    expiresIn: "1d",
  });
}

export function verifyToken<Payload extends {}>(token: string) {
  return verify(token, secret, {
    complete: false,
  }) as Payload;
}

export async function sendEmail(text: string) {
  console.log("Sending email...");
  console.log(text);
}
