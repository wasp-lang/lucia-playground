import { Router } from "express";
import { Google } from "arctic";

import { getRedirectUri, setupProviderHandlers } from "./utils.js";
import { auth } from "../../lucia.js";
import { env } from "../../env.js";

const name = "google";

const googleAuth = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  getRedirectUri(name),
  {
    scope: ["profile", "email"],
  }
);

export function setupGoogle(router: Router) {
  setupProviderHandlers(router, name, googleAuth, (user) => {
    return user;
  });
}
