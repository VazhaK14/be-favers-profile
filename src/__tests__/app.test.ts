import { describe, expect, beforeAll, afterAll, it } from "bun:test";
import { app } from "../index";
import { auth } from "../lib/auth";
import { beforeEach } from "node:test";
import type { TestHelpers } from "better-auth/plugins";
import type { User } from "@prisma/client";

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

describe("Auth Role Upgrade: User Lama via Test Utils", () => {
  const testEmail = "userlama_testutils@example.com";

  // Definisikan tipe data dengan ketat, hindari "any"
  let testHelpers: TestHelpers;
  let savedUser: User;
  beforeAll(async () => {
    // 1. Ekstrak utilities dari Better-Auth context
    const ctx = await auth.$context;

    // Type assertion jika TypeScript di versi Anda tidak bisa meng-infernya secara otomatis
    testHelpers = ctx.test as TestHelpers;
    // 2. FASE 1 (Masa Lalu): Buat dan simpan "User Lama"
    const userPayload = testHelpers.createUser({
      email: testEmail,
      name: "User Lama",
      // role: "user" -> secara default auth akan mengisi ini
    });

    // Kembalian dari saveUser adalah object tipe User
    savedUser = (await testHelpers.saveUser(userPayload)) as User;
  });
  afterAll(async () => {
    // 3. Bersihkan sisa-sisa test (Teardown)
    process.env.LIST_MEMBER = "";
    if (savedUser?.id) {
      await testHelpers.deleteUser(savedUser.id);
    }
  });
  it("HARUSNYA meng-upgrade role menjadi 'member' saat user lama membuat sesi (login) dan emailnya di whitelist", async () => {
    // FASE 2: Fitur Rilis -> Email masuk ke Whitelist
    process.env.LIST_MEMBER = testEmail;
    // FASE 3: User Lama Login (TestHelpers membuat sesi di database)
    // Hook session.create.before (Opsi 2) harusnya bereaksi di sini nantinya
    await testHelpers.login({
      userId: savedUser.id,
    });
    // Ambil Headers Auth (berisi Cookie session token)
    const authHeaders = await testHelpers.getAuthHeaders({
      userId: savedUser.id,
    });
    // FASE 4: Validasi Sesi menggunakan app.fetch Hono
    const meRes = await app.fetch(
      new Request("http://localhost/api/auth/get-session", {
        method: "GET",
        headers: authHeaders, // Header ini membuat request bersifat "authenticated"
      }),
    );
    const meData = await meRes.json();
    // 🚨 ASSERTION INI SAAT INI AKAN GAGAL (FAIL) 🚨
    // Karena kita belum menulis hook session.create.before di lib/auth.ts
    // Setelah hook itu ditulis, expect ini akan PASS.
    expect(meData.user?.role).toBe("member");
  });
});
