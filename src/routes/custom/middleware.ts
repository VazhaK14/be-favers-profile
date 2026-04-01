import { Context, Next } from "hono";
import { auth } from "../../lib/auth.js";

export const isMember = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session || session.user.role !== "member") {
    return c.json({ message: "Unauthorized: Member only" }, 401);
  }

  c.set("user", session.user);
  await next();
};
