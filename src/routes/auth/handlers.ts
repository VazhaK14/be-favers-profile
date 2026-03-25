import type { Context } from "hono";

export const helloWorld = async (c: Context) => {
  return c.json("List Books");
};
