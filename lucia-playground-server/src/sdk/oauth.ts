import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { env } from "../env.js";
import { createToken, verifyToken } from "./jwt.js";
import { parseCookies } from "oslo/cookie";

export function getRedirectUri(providerName: string) {
  return `${env.SERVER_URL}/auth/login/${providerName}/callback`;
}

export const tokenStore = createTokenStore();

function createTokenStore() {
  const usedTokens = new Map<string, number>();

  const validFor = 1000 * 60; // 1 minute
  const cleanupAfter = 1000 * 60 * 60; // 1 hour

  function cleanUp() {
    const now = Date.now();
    for (const [token, timestamp] of usedTokens.entries()) {
      if (now - timestamp > cleanupAfter) {
        usedTokens.delete(token);
      }
    }
  }

  return {
    createToken(userId: string) {
      return createToken(
        {
          id: userId,
        },
        validFor
      );
    },
    verifyToken(token: string) {
      return verifyToken<{ id: string }>(token);
    },
    isUsed(token: string) {
      return usedTokens.has(token);
    },
    markUsed(token: string) {
      usedTokens.set(token, Date.now());
      cleanUp();
    },
  };
}

type CookieName = {
  cookieName: string;
};

export function setValueInCookie(
  { cookieName }: CookieName,
  value: string,
  res: ExpressResponse
) {
  res.cookie(cookieName, value, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 1000, // 1 hour
  });
}

export function getValueFromCookie(
  { cookieName }: CookieName,
  req: ExpressRequest
) {
  const cookies = parseCookies(req.headers.cookie ?? "");
  return cookies.get(cookieName);
}

export function getStateCookieName(providerName: string) {
  return {
    cookieName: `${providerName}_oauth_state`,
  };
}

export function getCodeVerifierCookieName(providerName: string) {
  return {
    cookieName: `${providerName}_oauth_code_verifier`,
  };
}
