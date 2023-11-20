import { Router } from "express";
import { google } from "@lucia-auth/oauth/providers";

import { getRedirectUri, setupProviderHandlers } from "./utils.js";
import { auth } from "../../lucia.js";
import { env } from "../../env.js";

const name = "google";

const googleAuth = google(auth, {
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  redirectUri: getRedirectUri(name),
  scope: ["profile", "email"],
});

export function setupGoogle(router: Router) {
  setupProviderHandlers(router, name, googleAuth, (providerData) => {
    return providerData.googleUser;
  });
}
