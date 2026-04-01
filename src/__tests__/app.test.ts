import { describe, expect, beforeAll, afterAll, it } from "bun:test";
import { app } from "../index";
import { prisma } from "../lib/prisma";

describe("App endpoints", () => {
  it("GET /api/auth/ok should return ok object", async () => {
    const res = await app.request("/api/auth/ok");
    const body = await res.json();
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

    const spec = await res.json();
    expect(spec.openapi).toBeDefined();
    expect(spec.info.title).toContain("Better Auth");
  });
});

describe("Already exists user role upgrade to member", () => {
  const testEmail = "userlama@example.com";
  const testPassword = "password123";

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
  });
  afterAll(async () => {
    process.env.LIST_MEMBER = "";
    await prisma.user.deleteMany({ where: { email: testEmail } });
  });

  it("Supposed update role 'member' when old user in whitelist", async () => {
    process.env.LIST_MEMBER = "";
    await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: "Old User",
      }),
    });

    const initialUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    expect(initialUser?.role).toBe("user");

    process.env.LIST_MEMBER = testEmail;

    const loginRes = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    expect(loginRes.status).toBe(200);

    const loginData = await loginRes.json();
    const token = loginData.token || loginData.data?.token;

    const meRes = await app.request("/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const meData = await meRes.json();
    expect(meData.user?.role).toBe("member");
  });
});
