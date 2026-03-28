import { Hono } from "hono";
import { auth } from "../../lib/auth"; 

const authRouter = new Hono();

// Explicit route untuk OpenAPI
authRouter.get("/openapi.json", async (c) => {
  // Better Auth biasanya mengekspor schema melalui plugin OpenAPI
  const schema = await auth.api.generateOpenAPISchema();
  return c.json(schema);
});

// Fallback untuk semua endpoint auth lainnya (login, callback, get-session, dll)
authRouter.all("*", (c) => {
  return auth.handler(c.req.raw);
});

export default authRouter;