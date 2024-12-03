import { type Router } from "express";

import { setupSignup } from "./signup.js";
import { setupLogin } from "./login.js";
import { setupVerifyEmail } from "./verifyEmail.js";
import { setupRequestPasswordReset } from "./requestPasswordReset.js";
import { setupResetPassword } from "./resetPassword.js";

export function setupEmailAuth(router: Router) {
  setupSignup(router);
  setupLogin(router);
  setupVerifyEmail(router);
  setupRequestPasswordReset(router);
  setupResetPassword(router);
}
