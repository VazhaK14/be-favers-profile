import { Hono } from "hono";
import { setMemberAccount } from "./handlers";

const authRouter = new Hono();

authRouter.get("/test", setMemberAccount);

export default authRouter;
