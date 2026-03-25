import { describe, expect, it } from "bun:test";
import { app } from "../index";

describe("App endpoints", () => {
  it("GET /api/health should return 200 OK", async () => {
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("POST /api/auth/login should return 501 Not Implemented", async () => {
    const res = await app.request("/api/auth/login", {
      method: "POST",
    });
    expect(res.status).toBe(501);
  });

  it("POST /api/auth/register should return 501 Not Implemented", async () => {
    const res = await app.request("/api/auth/register", {
      method: "POST",
    });
    expect(res.status).toBe(501);
  });
});
