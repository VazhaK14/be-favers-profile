import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";
import { openAPI } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "user",
        },
      },
    },
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Asumsi LIST_MEMBER sudah berupa array (misal dari config atau global variable)
          const listMember = (process.env.LIST_MEMBER as unknown as string[]) || [];
          if (listMember.includes(user.email)) {
            return {
              data: {
                ...user,
                role: "member",
              },
            };
          }
          return { data: user };
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
    openAPI(), // Memastikan plugin OpenAPI aktif
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
