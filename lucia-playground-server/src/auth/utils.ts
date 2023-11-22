import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";

import { auth } from "../lucia.js";

export async function putUserInSession(
  userId: string,
  req: ExpressRequest,
  res: ExpressResponse
) {
  const session = await getSessionForUserId(userId);
  const authRequest = auth.handleRequest(req, res);
  authRequest.setSession(session);
}

export async function getSessionForUserId(userId: string) {
  return auth.createSession({
    userId,
    attributes: {},
  });
}
