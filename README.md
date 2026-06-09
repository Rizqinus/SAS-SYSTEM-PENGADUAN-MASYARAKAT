# SAS Fullstack: Next.js & Express.js Starter

Proyek ini adalah template arsitektur fullstack modern yang memisahkan frontend (menggunakan **Next.js**) dan backend (menggunakan **Express.js** dengan **TypeScript**).

## Struktur Folder

```text
SAS/
├── frontend/         # Aplikasi Next.js (React Framework, Port: 3000)
├── backend/          # Aplikasi Express.js (Node.js API, Port: 5000)
└── README.md         # Dokumentasi petunjuk (File ini)
```

---

## Persyaratan Awal
Pastikan Anda sudah menginstal:
- [Node.js](https://nodejs.org/) (versi 18+)
- npm (bawaan dari instalasi Node.js)

---

## Cara Menjalankan Aplikasi

Untuk menjalankan aplikasi ini secara lokal (development), ikuti langkah-langkah berikut:

### Langkah 1: Jalankan Backend Express.js
1. Buka terminal baru dan masuk ke direktori `backend`:
   ```bash
   cd backend
   ```
2. Jalankan server backend dalam mode development:
   ```bash
   npm run dev
   ```
   Server backend akan berjalan di **[http://localhost:5000](http://localhost:5000)**.
   Anda dapat menguji endpoint kesiapan backend di **[http://localhost:5000/api/health](http://localhost:5000/api/health)**.

### Langkah 2: Jalankan Frontend Next.js
1. Buka terminal baru lainnya (jangan matikan terminal backend) dan masuk ke direktori `frontend`:
   ```bash
   cd frontend
   ```
2. Jalankan server frontend dalam mode development:
   ```bash
   npm run dev
   ```
   Aplikasi frontend akan berjalan di **[http://localhost:3000](http://localhost:3000)**.
   Buka peramban (browser) Anda dan akses alamat tersebut. Halaman utama akan otomatis mencoba menghubungi backend Anda.

---

## Ringkasan Skrip Perintah

### Frontend (`frontend/`)
- `npm run dev`: Memulai server development (Next.js) di port 3000.
- `npm run build`: Membangun aplikasi Next.js untuk produksi.
- `npm run start`: Menjalankan aplikasi Next.js yang telah dibuild dalam mode produksi.
- `npm run lint`: Memeriksa kode menggunakan ESLint.

### Backend (`backend/`)
- `npm run dev`: Memulai server backend Express dengan auto-reload (`ts-node-dev`) di port 5000.
- `npm run build`: Mengompilasi kode TypeScript ke folder `dist` (JavaScript biasa).
- `npm run start`: Menjalankan file JavaScript hasil kompilasi produksi di folder `dist`.
