import { Hono } from "hono";
import { login, me, register, setMemberAccount } from "./handlers.js";

const authRouter = new Hono();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", me);

// Other auth routes (legacy/test)
authRouter.get("/test", setMemberAccount);

export default authRouter;
