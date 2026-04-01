import { Hono } from "hono";
import { prisma } from "../../lib/prisma.js";
import { isMember, type Env } from "./middleware.js";
import { z } from "zod";

const customRouter = new Hono<Env>();

// Zod Schema untuk Validasi Theme
const themeSchema = z.object({
  fontFamily: z.enum(["Geist Variable", "Inter", "Serif", "Mono"]),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid Hex color"),
  backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid Hex color"),
  cardColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid Hex color"),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid Hex color"),
  textColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid Hex color"),
});

// GET /api/custom (Public)
customRouter.get("/", async (c) => {
  const theme = await prisma.theme.findFirst();
  
  if (!theme) {
    return c.json({
      fontFamily: "Geist Variable",
      primaryColor: "#000000",
      backgroundColor: "#ffffff",
      cardColor: "#ffffff",
      accentColor: "#f3f4f6",
      textColor: "#000000",
    });
  }

  return c.json(theme);
});

// PATCH /api/custom (Member Only)
customRouter.patch("/", isMember, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();

  // Validasi menggunakan Zod
  const result = themeSchema.safeParse(body);
  if (!result.success) {
    return c.json({ message: "Validation failed", errors: result.error.errors }, 400);
  }

  const { fontFamily, primaryColor, backgroundColor, cardColor, accentColor, textColor } = result.data;

  const existingTheme = await prisma.theme.findFirst();

  let updatedTheme;
  if (existingTheme) {
    updatedTheme = await prisma.theme.update({
      where: { id: existingTheme.id },
      data: {
        fontFamily,
        primaryColor,
        backgroundColor,
        cardColor,
        accentColor,
        textColor,
      },
    });
  } else {
    updatedTheme = await prisma.theme.create({
      data: {
        fontFamily,
        primaryColor,
        backgroundColor,
        cardColor,
        accentColor,
        textColor,
        userId: user.id,
      },
    });
  }

  return c.json({ message: "Theme updated successfully", theme: updatedTheme });
});

export default customRouter;
