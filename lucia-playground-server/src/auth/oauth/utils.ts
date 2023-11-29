import * as z from "zod";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  Router,
} from "express";
import { env } from "../../env.js";
import { validateRequest } from "zod-express";
import { createToken, verifyToken } from "../utils.js";
import { generateState } from "arctic";
import { parseCookies } from "oslo/cookie";
import { createAuth, findAuth, findAuthProvider } from "../db.js";

export function getRedirectUri(providerName: string) {
  return `${env.SERVER_URL}/auth/login/${providerName}/callback`;
}

export function setupProviderHandlers<
  Provider extends {
    createAuthorizationURL(state: string): Promise<URL>;
    validateAuthorizationCode(code: string): Promise<any>;
    getUser(accessToken: string): Promise<any>;
  }
>(
  router: Router,
  providerName: string,
  provider: Provider,
  getUserData?: (user: any) => Record<string, unknown>
) {
  router.get(
    `/login/${providerName}`,
    async (_req: ExpressRequest, res: ExpressResponse) => {
      const state = generateState();
      const url = await provider.createAuthorizationURL(state);
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
        const tokens = await provider.validateAuthorizationCode(code);

        const { accessToken } = tokens;

        const userData = await provider.getUser(accessToken);

        const providerUserId = userData.sub ?? userData.id;

        if (!providerUserId) {
          return res.status(500).json({
            success: false,
            message: "Something went wrong",
          });
        }

        const providerUserIdString = `${providerUserId}`;

        const getAuth = async () => {
          const existingAuthProvider = await findAuthProvider(
            providerName,
            providerUserIdString
          );
          if (existingAuthProvider) {
            return findAuth(existingAuthProvider.authId);
          }
          const auth = await createAuth(
            providerName,
            providerUserIdString,
            getUserData?.(userData) ?? {}
          );
          return auth;
        };

        const auth = await getAuth();

        if (!auth) {
          return res.status(500).json({
            success: false,
            message: "Something went wrong",
          });
        }

        const oneTimeCode = tokenStore.createToken(auth.id);

        // Redirect to the client with the one time code
        return res
          .status(302)
          .setHeader("Location", `${env.CLIENT_URL}/callback#${oneTimeCode}`)
          .end();
      } catch (e) {
        // TODO: handle different errors
        console.error(e);

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
  state: string,
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
  const cookies = parseCookies(req.headers.cookie ?? "");
  const cookieName = getCookieName(providerName);
  return cookies.get(cookieName);
}

function getCookieName(providerName: string) {
  return `${providerName}_oauth_state`;
}
