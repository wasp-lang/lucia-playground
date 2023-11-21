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
import { putUserInSession } from "../utils.js";

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
    async (req: ExpressRequest, res: ExpressResponse) => {
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

        await putUserInSession(user.userId, req, res);

        // NOTE: this might be a deal breaker for us, since we need to redirect to a different domain
        return res.status(302).setHeader("Location", env.CLIENT_URL).end();
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