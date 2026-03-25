import { Hono } from "hono";
import { helloWorld } from "./handlers";

const authRouter = new Hono();

authRouter.get("/", helloWorld);

export default authRouter;
