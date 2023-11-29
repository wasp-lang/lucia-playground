import * as z from "zod";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  Router,
} from "express";
import { parseCookie } from "lucia/utils";
import {
  OAuth2ProviderAuth,
  OAuthRequestError,
  ProviderUserAuth,
} from "@lucia-auth/oauth";

import { env } from "../../env.js";
import { validateRequest } from "zod-express";
import { createToken, verifyToken } from "../utils.js";

export function getRedirectUri(providerName: string) {
  return `${env.SERVER_URL}/auth/login/${providerName}/callback`;
}

export function setupProviderHandlers<
  Provider extends OAuth2ProviderAuth<ProviderUserAuth<any>>
>(
  router: Router,
  providerName: string,
  provider: Provider,
  getUserData?: (
    providerData: Awaited<ReturnType<Provider["validateCallback"]>>
  ) => Record<string, unknown>
) {
  router.get(
    `/login/${providerName}`,
    async (_req: ExpressRequest, res: ExpressResponse) => {
      const [url, state] = await provider.getAuthorizationUrl();
      setStateInCookie(providerName, state, res);
      return res.status(302).setHeader("Location", url.toString()).end();
    }
  );

  router.get(
    `/login/${providerName}/callback`,
    validateRequest({
      query: z.object({
        state: z.string(),
        code: z.string(),
      }),
    }),
    async (req, res) => {
      const storedState = getStateFromCookie(providerName, req);
      const state = req.query.state;
      const code = req.query.code;

      if (
        !storedState ||
        !state ||
        storedState !== state ||
        typeof code !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid state",
        });
      }

      try {
        const providerData = await provider.validateCallback(code);

        const { getExistingUser, createUser } = providerData;

        const getUser = async () => {
          const existingUser = await getExistingUser();
          if (existingUser) {
            return existingUser;
          }
          const user = await createUser({
            attributes: {
              user: {
                create: {
                  // NOTE: used for the demo only
                  providerData: getUserData?.(providerData as any),
                },
              },
            },
          });
          return user;
        };

        const user = await getUser();

        const oneTimeCode = tokenStore.createToken(user.userId);

        // Redirect to the client with the one time code
        return res
          .status(302)
          .setHeader("Location", `${env.CLIENT_URL}/callback#${oneTimeCode}`)
          .end();
      } catch (e) {
        if (e instanceof OAuthRequestError) {
          return res.status(400).json({
            success: false,
            message: "Invalid code",
          });
        }

        return res.status(500).json({
          success: false,
          message: "Something went wrong",
        });
      }
    }
  );
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

function setStateInCookie(
  providerName: string,
  state: Awaited<ReturnType<OAuth2ProviderAuth["getAuthorizationUrl"]>>[1],
  res: ExpressResponse
) {
  const cookieName = getCookieName(providerName);
  res.cookie(cookieName, state, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 1000, // 1 hour
  });
}

function getStateFromCookie(providerName: string, req: ExpressRequest) {
  const cookies = parseCookie(req.headers.cookie ?? "");
  const cookieName = getCookieName(providerName);
  return cookies[cookieName];
}

function getCookieName(providerName: string) {
  return `${providerName}_oauth_state`;
}
