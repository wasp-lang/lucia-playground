import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  Router,
} from "express";
import * as z from "zod";
import { validateRequest } from "zod-express";
import { GitHub, generateState } from "arctic";

import {
  getStateCookieName,
  getValueFromCookie,
  setValueInCookie,
  tokenStore,
  findOrCreateAuthIdentity,
} from "../../index.js";
import { env } from "../../env.js";

const providerName = "github";

const github = new GitHub(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET);

export function setupGithub(router: Router) {
  router.get(
    `/login/${providerName}`,
    async (_req: ExpressRequest, res: ExpressResponse) => {
      const state = generateState();
      const url = await github.createAuthorizationURL(state, {
        scopes: ["identify", "email"],
      });
      setValueInCookie(getStateCookieName(providerName), state, res);
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
        const { accessToken } = await github.validateAuthorizationCode(code);

        // TODO: maybe an additional request to get the user's email?
        const response = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
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
