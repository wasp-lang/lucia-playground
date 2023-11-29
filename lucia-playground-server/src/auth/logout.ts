import { Router } from "express";

import { auth } from "../lucia.js";

export function setupLogout(router: Router) {
  router.post("/logout", async (req, res) => {
    const authRequest = auth.handleRequest(req, res);
    const { session } = await authRequest.validateBearerToken();

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    await auth.invalidateSession(session.id);

    authRequest.deleteSessionCookie(); // for session cookie

    return res.status(200).json({
      success: true,
    });
  });
}
