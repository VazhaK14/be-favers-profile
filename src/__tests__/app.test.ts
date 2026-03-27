import { describe, expect, it } from "bun:test";
import { app } from "../index";

describe("App endpoints", () => {
  it("GET /api/health should return 200 OK", async () => {
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("POST /api/auth/login should reject missing body", async () => {
    const res = await app.request("/api/auth/login", {
      method: "POST",
    });
    expect(res.status).toBe(400);
  });

  it("POST /api/auth/register should reject missing body", async () => {
    const res = await app.request("/api/auth/register", {
      method: "POST",
    });
    expect(res.status).toBe(400);
  });

  it("GET /api/auth/me should return unauthorized without bearer token", async () => {
    const res = await app.request("/api/auth/me");
    expect(res.status).toBe(401);
  });
});
