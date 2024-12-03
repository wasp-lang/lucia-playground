import { Router } from "express";
import { getSessionFromBearerToken, invalidateSession } from "../index.js";

export function setupLogout(router: Router) {
  router.post("/logout", async (req, res) => {
    const { session } = await getSessionFromBearerToken(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    await invalidateSession(session.id);

    return res.status(200).json({
      success: true,
    });
  });
}
