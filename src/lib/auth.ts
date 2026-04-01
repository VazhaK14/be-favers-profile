import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";
import { openAPI, testUtils } from "better-auth/plugins";
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  databaseHooks: {
    user: {
      // Hook untuk User Baru
      create: {
        before: async (user) => {
          const listMember =
            (process.env.LIST_MEMBER as unknown as string[]) || [];
          if (listMember.includes(user.email)) {
            return {
              data: {
                ...user,
                role: "MEMBER",
              },
            };
          }
          return { data: user };
        },
      },
    },
    session: {
      // Hook untuk User Lama (dijalankan setiap kali login/session dibuat)
      create: {
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
          });

          if (user) {
            const listMember =
              (process.env.LIST_MEMBER as unknown as string[]) || [];
            const isWhitelisted = listMember.includes(user.email);

            // Jika email ada di whitelist tapi di DB masih USER, upgrade ke MEMBER
            if (isWhitelisted && user.role === "USER") {
              await prisma.user.update({
                where: { id: user.id },
                data: { role: "MEMBER" },
              });
            }
            // Opsional: Jika email dihapus dari whitelist tapi di DB masih MEMBER, downgrade ke USER
            else if (!isWhitelisted && user.role === "MEMBER") {
              await prisma.user.update({
                where: { id: user.id },
                data: { role: "USER" },
              });
            }
          }
          return { data: session };
        },
      },
    },
  },
  rateLimit: {
    window: 10,
    max: 100,
  },

  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },

  plugins: [
    openAPI(),
    ...(process.env.NODE_ENV === "test" ? [testUtils()] : []),
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET as string,
  baseURL: process.env.BETTER_AUTH_URL as string,
  trustedOrigins: [process.env.FRONTEND_URL || "http://localhost:5173"],
});
