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
