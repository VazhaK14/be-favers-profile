import type { Context, Next } from "hono";
import { auth } from "../../lib/auth.js";

// Definisikan tipe untuk User sesuai Enum di Prisma
interface User {
  id: string;
  email: string;
  role: "USER" | "MEMBER";
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

  // Cast session.user sebagai User karena kita sudah definisikan enum di schema
  const user = session?.user as unknown as User | undefined;

  if (!session || user?.role !== "MEMBER") {
    return c.json({ message: "Unauthorized: Member only" }, 401);
  }

  c.set("user", user);
  await next();
};
