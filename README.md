# BE Favers Profile (Auth Service)

Backend repository untuk proyek Favers Profile. Dirancang menggunakan **Hono JS** dan **Bun**. Fokus utama dari service ini adalah untuk menangani Autentikasi menggunakan **Better-Auth** dan Database **PostgreSQL** via **Prisma ORM**.

## 🚀 Tech Stack

- **Framework**: Hono JS
- **Runtime & Package Manager**: Bun
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth Provider**: Better-Auth (Stubs Only)

---

## 🛠️ Tutorial Setup & Instalasi Lokal

Ikuti langkah-langkah di bawah ini untuk menjalankan server backend di mesin lokal Anda.

### 1. Prasyarat (Prerequisites)

Pastikan Anda sudah menginstal:

- **Bun**: `curl -fsSL https://bun.sh/install | bash`
- **PostgreSQL**: Bisa diinstal secara lokal di komputer Anda, menggunakan Docker, atau layanan cloud (seperti Supabase/Neon).

### 2. Instalasi Dependensi

Masuk ke direktori backend dan instal seluruh _package_ yang dibutuhkan:

```bash
cd be-favers-profile
bun install
```

### 3. Setup Database PostgreSQL

Anda memerlukan _connection string_ dari PostgreSQL. Formatnya seperti ini:
`postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE_NAME>`

**Langkah-langkah:**

1. Buat file bernama `.env` di dalam folder `be-favers-profile/` (sejajar dengan `package.json`).
2. Masukkan URL database Anda ke dalam file `.env` tersebut:

   ```env
   # Contoh jika menggunakan PostgreSQL lokal
   DATABASE_URL="postgresql://postgres:password_kamu@localhost:5432/favers_db"

   # URL Frontend untuk CORS
   FRONTEND_URL="http://localhost:5173"

   # Port dimana backend ini akan berjalan
   PORT=3001
   ```

3. Setelah URL dimasukkan, jalankan perintah ini untuk mendorong struktur tabel (schema) ke dalam database Anda:
   ```bash
   bunx prisma db push
   ```
   _Catatan: Ini akan otomatis membuat tabel User, Session, dan Account sesuai konfigurasi Better-Auth di `prisma/schema.prisma`._

### 4. Menjalankan Server Development

Jalankan server backend dengan perintah berikut:

```bash
bun run dev
```

Server akan menyala di `http://localhost:3001`. Anda bisa mengetesnya dengan membuka `http://localhost:3001/health` di browser.

---

## 🔌 API Auth untuk Frontend

Base URL lokal backend:
`http://localhost:3001`

Semua endpoint utama untuk FE ada di prefix:
`/api`

### 1) Health Check

- **Method**: `GET`
- **URL**: `/api/health`
- **Response 200**:

```json
{ "status": "ok" }
```

### 2) Register

- **Method**: `POST`
- **URL**: `/api/auth/register`
- **Body** (`application/json`):

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

- **Response 201**: data user baru
- **Response 409**: email sudah terdaftar

### 3) Login

- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Body** (`application/json`):

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

- **Response 200**: mengembalikan `token`, `expiresAt`, dan data `user`

Contoh response login berhasil:

```json
{
  "success": true,
  "message": "Logged in",
  "data": {
    "token": "uuid-token",
    "expiresAt": "2026-04-03T02:12:04.993Z",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "User Name"
    }
  },
  "meta": {
    "timestamp": "2026-03-27T02:12:05.759Z"
  }
}
```

### 4) Cek Sesi (untuk FE)

- **Method**: `GET`
- **URL**: `/api/auth/me`
- **Header wajib**:

```http
Authorization: Bearer <token_dari_login>
```

- **Response 200**: sesi valid (berisi data `user` + info `session`)
- **Response 401**: token tidak ada / tidak valid / expired

Contoh fetch dari FE:

```ts
const token = localStorage.getItem("token");
const res = await fetch("http://localhost:3001/api/auth/me", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
const data = await res.json();
```

### 5) Google OAuth via Better Auth

Endpoint Better Auth juga aktif di prefix yang sama (`/api/auth/*`), sehingga FE bisa trigger login Google langsung ke backend.

- **Method**: `POST`
- **URL**: `/api/auth/sign-in/social`
- **Body** (`application/json`):

```json
{
  "provider": "google",
  "callbackURL": "http://localhost:5173"
}
```

- **Behavior**: backend akan mengembalikan URL OAuth Google (atau redirect response sesuai mode request), lalu user diarahkan ke consent screen Google dan kembali ke callback URL FE.

Contoh trigger dari FE:

```ts
const res = await fetch("http://localhost:3001/api/auth/sign-in/social", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    provider: "google",
    callbackURL: "http://localhost:5173",
  }),
});
const data = await res.json();
window.location.href = data?.url;
```

Pastikan variabel env ini terisi:
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

---

## 📁 Struktur Folder Utama

Arsitektur aplikasi ini menggunakan pendekatan modular berbasis _route_:

```text
be-favers-profile/
├── prisma/
│   └── schema.prisma         # Definisi tabel Database (User, Session, Account)
├── src/
│   ├── lib/                  # Utilities dan konfigurasi
│   │   ├── errorHandler.ts   # Middleware Global Error Handler
│   │   ├── prisma.ts         # Konfigurasi instance Prisma Client
│   │   └── types.ts          # Global Type Definitions
│   ├── routes/               # Modular routing
│   │   └── auth/             # Modul khusus autentikasi
│   │       ├── handlers.ts   # Logika pemrosesan request (Koki)
│   │       ├── index.ts      # Definisi Router untuk modul ini
│   │       └── middleware.ts # Fungsi pencegat spesifik (Satpam)
│   ├── __tests__/            # File Unit Test
│   └── index.ts              # Entry point utama, Middleware Hono (CORS, Security)
└── .env                      # File rahasia (Database URL) -> JANGAN DI-COMMIT
```

---

## 🧪 Panduan Testing

Proyek ini menggunakan _test runner_ bawaan dari Bun yang sangat cepat.

Untuk menjalankan seluruh _unit test_ dan memastikan struktur API berfungsi:

```bash
bun test
```
