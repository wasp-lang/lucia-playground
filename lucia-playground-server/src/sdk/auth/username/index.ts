import { type Router } from "express";

import { setupSignup } from "./signup.js";
import { setupLogin } from "./login.js";

export function setupUsernameAuth(router: Router) {
  setupSignup(router);
  setupLogin(router);
}
