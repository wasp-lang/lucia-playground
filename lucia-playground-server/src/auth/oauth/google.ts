import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  Router,
} from "express";
import * as z from "zod";
import { validateRequest } from "zod-express";

import { Google, generateCodeVerifier, generateState } from "arctic";

import {
  getCodeVerifierCookieName,
  getRedirectUri,
  getStateCookieName,
  getValueFromCookie,
  setValueInCookie,
  tokenStore,
  findOrCreateAuthIdentity,
} from "../../sdk/index.js";
import { env } from "../../env.js";

const providerName = "google";

const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  getRedirectUri(providerName)
);

export function setupGoogle(router: Router) {
  router.get(
    `/login/${providerName}`,
    async (_req: ExpressRequest, res: ExpressResponse) => {
      const state = generateState();
      const codeVerifier = generateCodeVerifier();
      const url = await google.createAuthorizationURL(state, codeVerifier, {
        scopes: ["profile", "email"],
      });
      setValueInCookie(getStateCookieName(providerName), state, res);
      setValueInCookie(
        getCodeVerifierCookieName(providerName),
        codeVerifier,
        res
      );
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
      const storedState = getValueFromCookie(
        getStateCookieName(providerName),
        req
      );
      const storedCodeVerifier = getValueFromCookie(
        getCodeVerifierCookieName(providerName),
        req
      );
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

      if (!storedCodeVerifier) {
        return res.status(400).json({
          success: false,
          message: "Invalid code verifier",
        });
      }

      try {
        const { accessToken } = await google.validateAuthorizationCode(
          code,
          storedCodeVerifier
        );

        const response = await fetch(
          "https://openidconnect.googleapis.com/v1/userinfo",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const userData = (await response.json()) as {
          id?: string;
          sub?: string;
        };

        const providerUserId = userData.sub ?? userData.id;

        if (!providerUserId) {
          return res.status(500).json({
            success: false,
            message: "Something went wrong",
          });
        }

        const providerUserIdString = `${providerUserId}`;

        const auth = await findOrCreateAuthIdentity(
          providerName,
          providerUserIdString,
          userData
        );

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
