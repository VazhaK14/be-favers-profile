import { Hono } from "hono";
import { setMemberAccount } from "./handlers.js";

const authRouter = new Hono();

authRouter.get("/test", setMemberAccount);

export default authRouter;
