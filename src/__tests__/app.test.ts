import { describe, expect, beforeAll, afterAll, it } from "bun:test";
import { app } from "../index";
import type { JsonValue } from "@prisma/client/runtime/client";

describe("App endpoints", () => {
  it("GET /api/auth/ok should return ok object", async () => {
    const res = await app.request("/api/auth/ok");
    const body: { [ok: string]: JsonValue } = await res.json();
    expect(body.ok).toBe(true);
  });

  it("GET /api/health should return 200 OK", async () => {
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("GET /api/auth/get-session should return unauthenticated for no session", async () => {
    const res = await app.request("/api/auth/get-session");
    expect([200, 401]).toContain(res.status);
  });

  it("GET /api/auth/get-session should return null when no session exists", async () => {
    const res = await app.request("/api/auth/get-session");

    expect([200, 401]).toContain(res.status);

    if (res.status === 200) {
      const body = await res.json();
      expect(body).toBeNull();
    }
  });

  it("GET /api/auth/openapi.json should return valid OpenAPI spec", async () => {
    const res = await app.request("/api/auth/openapi.json");
    expect(res.status).toBe(200);

    const spec: any = await res.json();
    expect(spec.openapi).toBeDefined();
    expect(spec.info.title).toContain("Better Auth");
  });
});
