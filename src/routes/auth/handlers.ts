import type { Context } from "hono";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { hashPassword, verifyPassword } from "../../lib/password.js";
import { respond, respondError } from "../../lib/types.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const setMemberAccount = async (c: Context) => {
  return c.json("List Books");
};

function getBearerToken(authorization?: string | null) {
  if (!authorization) return null;
  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}

export const register = async (c: Context) => {
  const body = await c.req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return c.json(respondError("Invalid request body"), 400);
  const input = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) return c.json(respondError("Email already registered"), 409);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      emailVerified: false,
      accounts: {
        create: {
          providerId: "credentials",
          accountId: input.email,
          password: hashPassword(input.password),
        },
      },
    },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  return c.json(respond(user, "Registered"), 201);
};

export const login = async (c: Context) => {
  const body = await c.req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return c.json(respondError("Invalid request body"), 400);
  const input = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: {
      accounts: {
        where: { providerId: "credentials" },
        select: { password: true },
        take: 1,
      },
    },
  });

  const passwordHash = user?.accounts?.[0]?.password ?? null;
  if (!user || !passwordHash || !verifyPassword(input.password, passwordHash)) {
    return c.json(respondError("Invalid email or password"), 401);
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
  await prisma.session.create({
    data: {
      token,
      expiresAt,
      userId: user.id,
      ipAddress: c.req.header("x-forwarded-for") ?? undefined,
      userAgent: c.req.header("user-agent") ?? undefined,
    },
  });

  return c.json(
    respond(
      {
        token,
        expiresAt: expiresAt.toISOString(),
        user: { id: user.id, email: user.email, name: user.name },
      },
      "Logged in",
    ),
    200,
  );
};

export const me = async (c: Context) => {
  const token = getBearerToken(c.req.header("authorization"));
  if (!token) return c.json(respondError("Unauthorized"), 401);

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        select: { id: true, email: true, name: true, image: true, createdAt: true },
      },
    },
  });

  if (!session || session.expiresAt.getTime() <= Date.now()) {
    return c.json(respondError("Unauthorized"), 401);
  }

  return c.json(
    respond(
      {
        user: session.user,
        session: {
          token: session.token,
          expiresAt: session.expiresAt.toISOString(),
        },
      },
      "Session is valid",
    ),
    200,
  );
};
