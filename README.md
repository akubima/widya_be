# 📦 Sistem Manajemen Inventaris Barang — RESTful API

RESTful API untuk mengelola inventaris barang, dibangun dengan **Node.js**, **Express**, **TypeScript**, **PostgreSQL**, dan **Prisma ORM**.

---

## 🛠 Tech Stack

| Komponen | Teknologi |
| :--- | :--- |
| Language | TypeScript (Node.js) |
| Framework | Express.js |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Authentication | JWT (jsonwebtoken) + bcryptjs |
| Validation | Zod |
| Documentation | Swagger UI (swagger-ui-express) + Postman Collection |
| Containerization | Docker & Docker Compose |

---

## 🚀 Cara Menjalankan

### Opsi 1: Docker Compose (Recommended)

Jalankan seluruh stack (PostgreSQL + App) dengan satu perintah:

```bash
docker compose up --build -d
```

API akan tersedia di: `http://localhost:3000`
Swagger Docs: `http://localhost:3000/api-docs`

Untuk menghentikan:
```bash
docker compose down
```

### Opsi 2: Manual Setup

**Prasyarat:**
- Node.js >= 20
- PostgreSQL database yang sudah berjalan

```bash
# 1. Install dependencies
npm install

# 2. Salin file environment
cp .env.example .env
# Edit .env dan sesuaikan DATABASE_URL dengan koneksi PostgreSQL Anda

# 3. Jalankan migrasi database
npx prisma migrate dev

# 4. Jalankan server (development mode)
npx tsx --env-file=.env src/server.ts
```

API akan tersedia di: `http://localhost:3000`

---

## 📚 Dokumentasi API

### Swagger UI
Setelah server berjalan, buka: **`http://localhost:3000/api-docs`**

### Postman Collection
Import file `postman_collection.json` ke Postman. Token otomatis tersimpan setelah Register/Login.

### Endpoints

| Method | Endpoint | Deskripsi | Auth |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Registrasi user baru | ❌ |
| POST | `/api/auth/login` | Login, mengembalikan JWT | ❌ |
| POST | `/api/items` | Tambah barang baru | ✅ |
| GET | `/api/items` | Daftar barang (search + pagination) | ✅ |
| GET | `/api/items/:id` | Detail barang berdasarkan ID | ✅ |
| PUT | `/api/items/:id` | Update data barang | ✅ |
| DELETE | `/api/items/:id` | Hapus barang | ✅ |

**Query Parameters untuk GET /api/items:**
- `search` — Cari berdasarkan nama atau deskripsi (case-insensitive)
- `page` — Nomor halaman (default: 1)
- `limit` — Jumlah item per halaman (default: 10, max: 100)

---

## 📝 Jawaban Pertanyaan Pemahaman

### 1. Alur Request (Request Lifecycle)

Berikut adalah alur perjalanan sebuah HTTP request dari client hingga data tersimpan di database:

```
Client (Postman/Frontend)
      │
      ▼
┌──────────────────┐
│  Express Router  │  Mencocokkan URL path & HTTP method
└────────┬─────────┘  ke handler yang sesuai
         │
         ▼
┌──────────────────┐
│  Middleware       │  1. Auth Middleware: Memverifikasi JWT token
│  Chain            │     dari header "Authorization: Bearer <token>".
│                   │     Jika valid, data user (userId, email) di-attach
│                   │     ke objek req.user.
│                   │  2. Validation Middleware: Menjalankan Zod schema
│                   │     untuk memvalidasi req.body, req.query, req.params.
│                   │     Jika tidak valid, langsung mengembalikan 400 Bad Request.
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Controller      │  Mengekstraksi data dari req (body, params, query),
│                   │  memanggil Service yang sesuai, lalu mengembalikan
│                   │  response HTTP (200, 201, 400, 404, dll).
│                   │  Controller TIDAK mengandung business logic.
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Service         │  Tempat MURNI business logic berada.
│                   │  Contoh: validasi kepemilikan barang, pengecekan
│                   │  duplikasi email/username, hashing password.
│                   │  Service tidak mengetahui apa itu req/res Express.
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Prisma ORM      │  Mengeksekusi query ke PostgreSQL
│  (Database)      │  (SELECT, INSERT, UPDATE, DELETE)
└──────────────────┘
```

**Mengapa memisahkan logic seperti ini?**

1. **Single Responsibility Principle (SRP):** Setiap layer hanya bertanggung jawab atas satu hal. Controller hanya mengurusi protokol HTTP (parsing request, mengirim response). Service hanya mengurusi aturan bisnis.

2. **Testability:** Service layer dapat di-unit test secara independen tanpa perlu menyalakan server HTTP atau memalsukan objek request/response Express. Cukup panggil method service dengan parameter biasa.

3. **Reusability:** Jika di masa depan aplikasi ingin menambahkan antarmuka lain (misal: GraphQL API, CLI script, background job/cron, atau WebSocket handler), seluruh business logic di Service dapat dipakai ulang tanpa perubahan apapun.

4. **Maintainability:** Ketika ada bug di validasi data, kita tahu harus melihat di Middleware/Schema. Ketika ada bug di aturan bisnis, kita langsung lihat Service. Tidak perlu membaca ratusan baris kode di satu file besar.

---

### 2. Keamanan & Token JWT — LocalStorage vs HttpOnly Cookie

**Local Storage:**
- Kelebihan: Sangat mudah digunakan di Single Page Application (Vue.js/React). Tinggal baca tokennya dan masukkan ke header `Authorization: Bearer <token>` pada setiap request API.
- Risiko: Rentan terhadap serangan XSS (Cross-Site Scripting)**. Jika website memiliki celah injeksi script (misalnya dari input user yang tidak di-sanitize, atau dari library/dependency pihak ketiga yang compromised), script jahat tersebut bisa mengeksekusi `localStorage.getItem('token')` dan mengirim token ke server penyerang. Setelah token dicuri, penyerang bisa menyamar sebagai user tersebut.

**HttpOnly Cookie:**
- Kelebihan: Kebal terhadap serangan XSS, karena JavaScript di browser sama sekali tidak memiliki akses untuk membaca atau menulis cookie yang berlabel `HttpOnly`. Token aman dari pencurian meskipun ada celah XSS.
- Risiko: Rentan terhadap serangan CSRF (Cross-Site Request Forgery). Browser secara otomatis menyertakan cookie pada setiap request ke domain asal (origin), sehingga website jahat bisa memancing request HTTP ke API kita tanpa disadari user. Mitigasi: gunakan atribut `SameSite=Strict` atau `SameSite=Lax` pada cookie, serta implementasikan anti-CSRF token.

**Rekomendasi:**

Arsitektur yang paling aman adalah **kombinasi keduanya**:

1. **Access Token** (masa hidup pendek, misal 15 menit) dan disimpan di **in-memory state** frontend (contoh: Vue reactive state / Pinia store). Tidak disimpan di localStorage maupun cookie. Token ini hilang saat tab ditutup, sehingga window of attack sangat kecil.

2. **Refresh Token** (masa hidup panjang, misal 7 hari) dan disimpan di **HttpOnly Secure Cookie** dengan atribut `SameSite=Strict; Secure; Path=/api/auth/refresh`. Cookie ini hanya dikirim ke endpoint refresh token, bukan ke seluruh API.

3. Ketika Access Token expired, frontend secara otomatis memanggil endpoint `/api/auth/refresh` yang membaca Refresh Token dari cookie, memvalidasinya, lalu mengembalikan Access Token baru.

Dengan cara ini:
- Access Token tidak bisa dicuri via XSS (karena ada di memory, bukan localStorage).
- Refresh Token tidak bisa dicuri via XSS (karena HttpOnly cookie).
- CSRF diminimalisir karena cookie hanya dikirim ke endpoint refresh (bukan ke endpoint sensitif lain) dan dilindungi oleh `SameSite=Strict`.

---

### 3. Penanganan Konkurensi (Concurrency / Race Condition Stok)

**Skenario Masalah:**

Barang X memiliki stok tersisa = 1. Dua user (A dan B) secara bersamaan melakukan request untuk membeli/mengurangi stok:

```
Waktu  │  User A                          │  User B
───────┼──────────────────────────────────┼──────────────────────────────────────────────
t1     │  SELECT stock;  Hasil: 1         │
t2     │                                  │  SELECT stock; Hasil: 1
t3     │  Check: 1 > 0 (OK); stock = 0    │
t4     │                                  │  Check: 1 > 0 (OK); stock = -1 (NOT ALLOWED)
```

Kedua user membaca stok = 1 sebelum yang lain sempat menyimpan pembaruan. Ini disebut **Race Condition** atau **TOCTOU (Time-of-Check to Time-of-Use) Bug**.

**Strategi Solusi:**

#### Solusi 1: Atomic Database Update (Paling Praktis & Berkinerja Tinggi)

Jangan melakukan READ terpisah dari WRITE. Lakukan update atomik langsung di level database:

```sql
UPDATE "Item"
SET stock = stock - 1
WHERE id = :id AND stock >= 1;
```

- Database menjamin operasi `UPDATE` bersifat **atomic** (tidak bisa diinterupsi di tengah jalan).
- Jika `stock >= 1` tidak terpenuhi (karena user lain sudah mengurangi lebih dulu), maka jumlah baris yang ter-update = 0.
- Aplikasi cukup memeriksa: jika affected rows = 0, kembalikan error `400 Bad Request` ("Stok tidak mencukupi").

```typescript
// Implementasi Prisma
const result = await prisma.$executeRaw`
  UPDATE "Item" SET stock = stock - 1 WHERE id = ${id} AND stock >= 1
`;
if (result === 0) {
  throw new Error('Stok tidak mencukupi');
}
```

#### Solusi 2: Database Check Constraint

Pasang constraint di PostgreSQL agar database MENOLAK transaksi apapun yang membuat stok negatif:

```sql
ALTER TABLE "Item" ADD CONSTRAINT check_stock_positive CHECK (stock >= 0);
```

Ini adalah **safety net** yang menjamin data integrity bahkan jika ada bug di kode aplikasi. Pada proyek ini, constraint ini dipasang di migration Prisma.

#### Solusi 3: Pessimistic Locking (`SELECT ... FOR UPDATE`)

Untuk transaksi kompleks yang melibatkan beberapa operasi (misal: checkout keranjang dengan banyak barang):

```typescript
await prisma.$transaction(async (tx) => {
  // Kunci baris item sehingga transaksi lain harus mengantre
  const [item] = await tx.$queryRaw<Item[]>`
    SELECT * FROM "Item" WHERE id = ${id} FOR UPDATE
  `;

  if (item.stock < quantity) {
    throw new Error('Stok tidak mencukupi');
  }

  await tx.item.update({
    where: { id },
    data: { stock: item.stock - quantity },
  });
});
```

`SELECT FOR UPDATE` mengunci baris tersebut di level PostgreSQL. User B yang ingin mengakses baris yang sama harus menunggu hingga transaksi User A selesai (commit atau rollback).

**Pada proyek ini**, saya mengimplementasikan kombinasi **Solusi 1 (Atomic Update)** dan **Solusi 2 (Check Constraint)** sebagai pendekatan yang paling efisien dan aman.

---

## 📁 Struktur Proyek

```
src/
├── config/
│   ├── env.ts              # Validasi environment variables (Zod)
│   └── database.ts         # Prisma client singleton
├── controllers/
│   ├── auth.controller.ts  # HTTP handler: Register & Login
│   └── item.controller.ts  # HTTP handler: CRUD Items
├── middlewares/
│   ├── auth.middleware.ts   # JWT Bearer token verification
│   ├── validate.middleware.ts  # Zod schema validation
│   └── error.middleware.ts # Global error handler & 404
├── routes/
│   ├── auth.routes.ts      # /api/auth endpoints
│   ├── item.routes.ts      # /api/items endpoints (protected)
│   └── index.ts            # Route aggregator
├── schemas/
│   ├── auth.schema.ts      # Zod schemas untuk auth
│   └── item.schema.ts      # Zod schemas untuk items
├── services/
│   ├── auth.service.ts     # Business logic: auth
│   └── item.service.ts     # Business logic: items
├── types/
│   └── express.d.ts        # Extend Express Request type
├── utils/
│   ├── response.util.ts    # Standardized JSON response helpers
│   └── token.util.ts       # JWT generate & verify
├── docs/
│   └── swagger.ts          # Swagger/OpenAPI configuration
└── server.ts               # Application entry point
```


