import { Hono } from "hono";
import { prisma } from "../../lib/prisma.js";
import { isMember } from "./middleware.js";

const customRouter = new Hono();

// GET /api/custom (Public)
// Mengambil konfigurasi tema global
customRouter.get("/", async (c) => {
  const theme = await prisma.theme.findFirst();
  
  // Jika belum ada tema di DB, kembalikan default
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
// Mengubah konfigurasi tema global
customRouter.patch("/", isMember, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();

  const { fontFamily, primaryColor, backgroundColor, cardColor, accentColor, textColor } = body;

  // 1. Validasi Hex Code (#000000 atau #000)
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const colors = [primaryColor, backgroundColor, cardColor, accentColor, textColor];
  
  for (const color of colors) {
    if (color && !hexRegex.test(color)) {
      return c.json({ message: `Invalid Hex color format for: ${color}` }, 400);
    }
  }

  // 2. Validasi Font (Dropdown options)
  const allowedFonts = ["Geist Variable", "Inter", "Serif", "Mono"];
  if (fontFamily && !allowedFonts.includes(fontFamily)) {
    return c.json({ message: `Invalid Font selection: ${fontFamily}. Must be one of: ${allowedFonts.join(", ")}` }, 400);
  }

  // Cari theme yang sudah ada (global)
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
