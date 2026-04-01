import type { Context, Next } from "hono";
import { auth } from "../../lib/auth.js";

// Definisikan tipe untuk User agar TS tidak komplain tentang .role
interface User {
  id: string;
  email: string;
  role: string;
}

// Definisikan Variables untuk Hono Context
export type Env = {
  Variables: {
    user: User;
  };
};

export const isMember = async (c: Context<Env>, next: Next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  // Cast session.user sebagai User karena kita tahu role ada di DB
  const user = session?.user as User | undefined;

  if (!session || user?.role !== "member") {
    return c.json({ message: "Unauthorized: Member only" }, 401);
  }

  c.set("user", user);
  await next();
};
