import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";

import { auth } from "../lucia.js";

export async function putUserInSession(
  userId: any,
  req: ExpressRequest,
  res: ExpressResponse
) {
  const session = await auth.createSession({
    userId,
    attributes: {},
  });
  const authRequest = auth.handleRequest(req, res);
  authRequest.setSession(session);
}
