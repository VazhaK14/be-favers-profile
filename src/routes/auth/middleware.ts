import type { Context, Next } from "hono";
import { auth } from "../../lib/auth.js";
import { respondError } from "../../lib/types.js";

export const sessionMiddleware = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json(respondError("Unauthorized"), 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);

  await next();
};