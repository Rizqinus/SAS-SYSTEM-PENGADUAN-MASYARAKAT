# Panduan Lengkap: Setup Full-Stack Next.js, Express.js (TypeScript), & MySQL

Dokumen ini berisi panduan langkah-demi-langkah dari awal untuk membuat arsitektur aplikasi web full-stack menggunakan **Next.js** (Frontend), **Express.js dengan TypeScript** (Backend API), dan **MySQL** (Database).

---

## 1. Arsitektur Sistem

Aplikasi ini menggunakan model arsitektur terpisah (*decoupled*):
* **Frontend (Next.js)** berjalan di port `3000` dan merender antarmuka pengguna (UI).
* **Backend (Express.js)** berjalan di port `5000` sebagai RESTful API yang memproses data.
* **Database (MySQL)** berjalan di port `3306` untuk menyimpan data.
* Frontend berkomunikasi dengan Backend melalui protokol HTTP menggunakan client **Axios** dengan proteksi **CORS (Cross-Origin Resource Sharing)**.

```text
+-------------------+             HTTP (Axios)            +-------------------+
| Next.js Frontend  | <=================================> | ExpressJS Backend |
|   (Port 3000)     |                                     |    (Port 5000)    |
+-------------------+                                     +-------------------+
                                                                    ||
                                                                    || mysql2/promise
                                                                    \/
                                                          +-------------------+
                                                          |  MySQL Database   |
                                                          |    (Port 3306)    |
                                                          +-------------------+
```

---

## 2. Langkah 1: Setup Struktur Proyek

Buat folder utama proyek (misal: `SAS`) yang di dalamnya memiliki dua subfolder terpisah:
```text
SAS/
├── frontend/         # Folder khusus aplikasi Next.js
└── backend/          # Folder khusus API Express.js
```

---

## 3. Langkah 2: Setup Frontend (Next.js & Tailwind CSS v4)

### A. Inisialisasi & Instalasi Dependensi
1. Jalankan perintah berikut di root folder (`SAS`) untuk membuat struktur awal Next.js App Router dengan TypeScript secara non-interaktif:
   ```bash
   npx -y create-next-app@latest frontend --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --disable-git
   ```
2. Masuk ke direktori `frontend` dan pasang dependensi tambahan HTTP client (Axios):
   ```bash
   cd frontend
   npm install axios
   npm install -D @tailwindcss/postcss
   ```

### B. Struktur Folder Frontend (Next.js App Router)
Next.js menggunakan folder `src/app` sebagai sistem routing utama (*File-based Routing*). Berikut adalah struktur berkas penting yang telah diimplementasikan:
```text
frontend/
├── src/
│   ├── app/                    # Sistem Routing App Router
│   │   ├── admin/              # Halaman khusus Admin
│   │   │   ├── dashboard/      # Dashboard manajemen laporan admin
│   │   │   ├── detail-laporan/ # Detil laporan tindakan admin
│   │   │   ├── kelola-user/    # Manajemen pengguna/petugas
│   │   │   └── manajemen-laporan/
│   │   ├── laporan/
│   │   │   └── [id]/           # Detail laporan publik (dynamic route)
│   │   ├── pelapor/            # Halaman khusus Pelapor (User)
│   │   │   ├── buat-laporan/   # Formulir pengaduan kerusakan baru
│   │   │   ├── dashboard/      # Dashboard status laporan user
│   │   │   └── lihat-laporan/  # Daftar semua laporan oleh pelapor
│   │   ├── proses-pengaduan/   # Alur proses pengaduan/prosedur
│   │   ├── statistik/          # Halaman visualisasi statistik & grafik
│   │   ├── login/              # Halaman autentikasi masuk
│   │   ├── register/           # Halaman registrasi akun baru
│   │   ├── globals.css         # Styling global Tailwind v4
│   │   ├── layout.tsx          # Root Layout (memuat styling global & fonts)
│   │   └── page.tsx            # Landing Page utama
│   │
│   ├── components/             # Komponen UI Reusable
│   │   ├── DetailLaporanAdminClient.tsx
│   │   ├── DetailLaporanPublicClient.tsx
│   │   ├── PublicNavbar.tsx
│   │   └── PublicFooter.tsx
│   │
│   └── utils/
│       └── api.ts              # Konfigurasi Axios Client Instance + Interceptor JWT
```

### C. Autentikasi & Proteksi Halaman Client-Side
Dalam Next.js App Router, proteksi rute client-side dilakukan dengan memeriksa token JWT dan informasi pengguna dari `localStorage` pada fase inisialisasi komponen. Jika tidak ditemukan, pengguna dialihkan kembali ke halaman `/login`.

Contoh implementasi di `src/app/pelapor/buat-laporan/page.tsx`:
```tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BuatLaporan() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.replace('/login');
      return;
    }
    
    try {
      setUserData(JSON.parse(userStr));
    } catch (e) {
      router.replace('/login');
    }
  }, [router]);

  if (!userData) return null; // Mencegah flash screen sebelum redirect
  
  return (
    // Render layout buat laporan jika user terverifikasi
  );
}
```

### D. Solusi Mencegah *Hydration Mismatch* (React 19)
Saat menampilkan informasi dinamis dari browser (seperti status login yang dibaca dari `localStorage` atau render waktu dinamis), browser dan server rendering menghasilkan output awal HTML yang berbeda. Hal ini memicu error *Hydration Mismatch*.
**Solusi:** Lakukan inisialisasi state setelah komponen selesai terpasang (*mounted*) di client-side menggunakan hook `useEffect`.

Contoh pada komponen `src/components/PublicFooter.tsx`:
```tsx
"use client";

import { useEffect, useState } from 'react';

export default function PublicFooter() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear()); // Hanya dijalankan di browser (client)
  }, []);

  return (
    <footer>
      <p>&copy; {year || 2026} SAS - Sistem Pengaduan Jalan</p>
    </footer>
  );
}
```

### E. Integrasi & Pemanggilan API dengan Axios

Untuk mempermudah pemanggilan REST API dari Backend, aplikasi ini menggunakan **Axios** alih-alih `fetch` API bawaan browser.

#### Keuntungan Menggunakan Axios:
1. **Otomatis Parsing JSON:** Tidak perlu lagi menulis `await response.json()`, data hasil respons server langsung tersedia di properti `.data`.
2. **Penanganan Error Terpusat:** Respons status HTTP di luar jangkauan 2xx (seperti 400, 401, 500) akan otomatis memicu block `catch(error)`.
3. **Interceptors:** Memungkinkan penambahan Header Authorization secara global untuk seluruh pemanggilan API.

#### Pembuatan Axios Client Instance (`src/utils/api.ts`)
Berkas ini bertindak sebagai perantara pemanggilan API tunggal yang secara otomatis menyertakan Token JWT Pelapor/Admin saat tersimpan di `localStorage`:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// Menambahkan token JWT secara otomatis pada setiap request ke Backend
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
```

#### Contoh Cara Penggunaan di Komponen (GET Request):
```typescript
import api from '@/utils/api';

const fetchLaporan = async () => {
  try {
    const response = await api.get('/laporan/my/all');
    setLaporan(response.data); // data otomatis diparse ke object JSON
  } catch (error) {
    console.error('Error fetching laporan:', error);
  }
};
```

#### Contoh Cara Penggunaan di Komponen (POST Request dengan FormData / Upload Gambar):
```typescript
import api from '@/utils/api';

const handleSubmit = async (formData) => {
  try {
    const data = new FormData();
    data.append('judul', formData.judul);
    if (foto) data.append('foto', foto);

    // Axios otomatis menyetel Content-Type ke multipart/form-data jika menerima instance FormData
    const response = await api.post('/laporan', data);
    alert('Laporan berhasil terkirim!');
  } catch (error) {
    alert(error.response?.data?.message || 'Terjadi kesalahan.');
  }
};
```

---

## 4. Langkah 3: Setup Backend (Express.js & TypeScript)

### A. Inisialisasi & Instalasi Dependensi
1. Buat folder `backend`, masuk ke direktori tersebut, lalu jalankan perintah inisialisasi:
   ```bash
   cd backend
   npm init -y
   ```
2. Tambahkan `"type": "module"` ke `package.json` untuk mengaktifkan dukungan ES Modules secara native di Node.js.
3. Instal dependensi backend utama (termasuk modul keamanan & upload file):
   ```bash
   npm install express cors dotenv mysql2 bcrypt jsonwebtoken multer uuid
   ```
4. Instal dependensi pengembangan (*devDependencies*) untuk kompilasi dan hot-reloading:
   ```bash
   npm install -D typescript @types/express @types/cors @types/node @types/bcrypt @types/jsonwebtoken @types/multer @types/uuid nodemon tsx ts-node-dev
   ```
   * `typescript`: Compiler TypeScript.
   * `nodemon`: Alat pemantau berkas untuk auto-restart server saat ada perubahan.
   * `tsx`: Runtime executor TypeScript super cepat berbasis ESBuild (menggantikan `ts-node` untuk ESM).

### B. Struktur Folder Backend
Struktur folder backend Express.js terstruktur dengan pemisahan tugas (*separation of concerns*) yang jelas:
```text
backend/
├── src/
│   ├── config/           # Konfigurasi koneksi database (db.ts)
│   ├── controllers/      # Logika bisnis utama (menangani request & response)
│   ├── middlewares/      # Fungsi penengah (autentikasi token JWT, upload multer)
│   ├── routes/           # Daftar URL endpoint API
│   └── server.ts         # File utama (entry point) aplikasi Express.js
├── dist/                 # Folder hasil kompilasi dari TypeScript ke JavaScript
├── uploads/              # Folder penyimpanan file foto/gambar laporan terunggah
├── .env                  # Variabel lingkungan / rahasia (Password DB, JWT Secret)
├── package.json          # Informasi dependensi dan skrip proyek
└── tsconfig.json         # Konfigurasi compiler TypeScript
```

### C. Konfigurasi Compiler TypeScript (`tsconfig.json`)
Konfigurasi `backend/tsconfig.json` yang disesuaikan dengan fitur NodeNext ESM:
```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "target": "esnext",
    "types": [],
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "strict": true,
    "jsx": "react-jsx",
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "skipLibCheck": true
  },
  "ts-node": {
    "esm": true,
    "experimentalEsm": true
  },
  "include": ["src/**/*"]
}
```

### D. Konfigurasi Skrip Startup (`package.json`)
Tambahkan perintah untuk mode pengembangan menggunakan **Nodemon** dan **tsx** di dalam `package.json` backend:
```json
"type": "module",
"main": "dist/server.js",
"scripts": {
  "build": "tsc",
  "start": "node dist/server.js",
  "dev": "nodemon --exec tsx src/server.ts"
}
```

---

## 5. Langkah 4: Setup & Koneksi Database MySQL

### A. Struktur Tabel Database (Skema SQL)
Pastikan Anda telah membuat database bernama `db_sistem_pengaduan_infrastruktur_jalan` di MySQL. Berikut adalah rancangan tabel relasional lengkap yang digunakan di sistem ini:

```sql
-- 1. Tabel Users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    nik VARCHAR(20) UNIQUE,
    nama_lengkap VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin', 'super_admin') DEFAULT 'user',
    no_telp VARCHAR(20),
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabel Categories
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    nama_kategori VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Tabel Laporan (Menggunakan relasi category_id)
CREATE TABLE IF NOT EXISTS laporan (
    id VARCHAR(50) PRIMARY KEY, 
    pelapor_id VARCHAR(50) NOT NULL,
    category_id VARCHAR(50) NOT NULL,
    judul VARCHAR(150) NOT NULL,
    deskripsi TEXT NOT NULL,
    lokasi_jalan VARCHAR(255) NOT NULL,
    tingkat_kerusakan ENUM('ringan', 'sedang', 'berat') NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'in_progress', 'resolved') DEFAULT 'pending',
    foto_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pelapor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 4. Tabel Komentar
CREATE TABLE IF NOT EXISTS komentar (
    id VARCHAR(50) PRIMARY KEY,
    laporan_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    isi_komentar TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (laporan_id) REFERENCES laporan(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### B. Konfigurasi Environment Variables (`.env`)
Buat berkas `backend/.env` untuk menyimpan konfigurasi:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=db_sistem_pengaduan_infrastruktur_jalan
JWT_SECRET=rahasia_super_aman_anda
```

### C. Membuat Connection Pool (`backend/src/config/db.ts`)
Menggunakan **Promise wrapper** dari `mysql2` dengan konfigurasi pool:
```typescript
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_sistem_pengaduan_infrastruktur_jalan',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
```

### D. Entrypoint Aplikasi & Inisialisasi Database (`backend/src/server.ts`)
Ketika server backend dijalankan pertama kali, ia akan melakukan pengujian koneksi dan memastikan tabel-tabel penting beserta data dummy kategori terbuat secara otomatis:
```typescript
import express from "express";
import cors from "cors";
import path from "path";
import pool from "./config/db.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Uji koneksi DB & startup logik di app.listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server berjalan di port ${PORT}`);
  try {
    const connection = await pool.getConnection();
    console.log("✅ Berhasil terkoneksi ke database MySQL!");
    connection.release();
  } catch (error) {
    console.error("❌ Gagal terkoneksi ke database MySQL:", error.message);
  }
});
```

---

## 6. Cara Menjalankan Seluruh Sistem

### Langkah A: Aktifkan Server Database
* Buka **XAMPP** Control Panel, pastikan Anda mengeklik tombol **Start** pada layanan **MySQL**.
* Buat database baru bernama `db_sistem_pengaduan_infrastruktur_jalan` melalui phpMyAdmin.

### Langkah B: Nyalakan Backend API
1. Buka terminal baru, masuk ke direktori `backend`.
2. Jalankan perintah:
   ```bash
   npm run dev
   ```

### Langkah C: Nyalakan Frontend Web
1. Buka terminal baru lainnya, masuk ke direktori `frontend`.
2. Jalankan perintah:
   ```bash
   npm run dev
   ```

### Langkah D: Buka di Browser
Akses alamat **[http://localhost:3000](http://localhost:3000)** di browser Anda.

---

## 7. Pemecahan Masalah (Troubleshooting)

### A. Port 5000 Bentrok (`EADDRINUSE`)
Jika muncul error `listen EADDRINUSE: address already in use :::5000`, artinya port 5000 sedang diduduki proses lama.
* **Solusi Windows (PowerShell)**:
  Jalankan perintah ini untuk membersihkan port 5000 secara paksa:
  ```powershell
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
  ```

### B. CORS Error di Browser
Jika frontend gagal melakukan fetch dan konsol browser menampilkan pesan CORS:
* Pastikan backend telah memasang middleware `cors` (`app.use(cors())`) sebelum mendefinisikan rute API.

---

## 8. Panduan Penjelasan Sistem (Untuk Presentasi)

Jika Anda perlu menjelaskan struktur dan cara kerja aplikasi ini kepada orang lain (misalnya dosen, penguji, tim, atau klien), Anda bisa menggunakan narasi penjelasan berikut yang dirangkum menjadi poin-poin sederhana:

### A. Penjelasan Konsep Arsitektur (*Decoupled*)
* **Mengapa dipisah?** Sistem ini sengaja memisahkan antara bagian antarmuka pengguna (Frontend) dan pemroses data (Backend). Tujuannya agar aplikasi lebih aman, lebih terstruktur, dan lebih mudah dikembangkan di masa depan (misalnya jika nanti ingin membuat versi aplikasi *mobile*, backend-nya tidak perlu diubah).
* **Bagaimana sistem berkomunikasi?** Frontend (Next.js) dan Backend (Express.js) berjalan secara terpisah. Ketika Frontend butuh data, ia akan "meminta" (*request*) ke Backend melalui **REST API**. Backend kemudian merespons dengan mengirimkan data mentah berformat JSON, lalu Frontend mengubahnya menjadi tampilan visual (UI) yang bagus.

### B. Penjelasan Peran Setiap Teknologi
* **Next.js (Frontend):** Berfungsi sebagai "wajah" aplikasi. Next.js dipilih karena performanya sangat cepat. Kita menggunakan App Router untuk manajemen halaman dan **Tailwind CSS** agar desain antarmukanya (*UI*) otomatis responsif dan modern ketika dibuka di HP maupun laptop.
* **Express.js & TypeScript (Backend):** Berfungsi sebagai "otak" pengontrol aplikasi. **Express.js** bertugas menerima permintaan dari Frontend, memvalidasi keamanan, dan menjalankan logika bisnis (misalnya mengecek hak akses admin). **TypeScript** ditambahkan untuk membuat kode jauh lebih aman dari *bug* karena struktur datanya dipaksa ketat sejak awal penulisan kode.
* **MySQL (Database):** Berfungsi sebagai "brankas penyimpanan". Karena ini adalah sistem pengaduan, datanya terstruktur dengan jelas (ada *user*, *admin*, *super admin*, dan *laporan*). Basis data relasional (RDBMS) seperti MySQL adalah pilihan paling tepat dan stabil.

### C. Contoh Alur Kerja (Cara Menjelaskan Fitur Utama)
Sebagai contoh, inilah yang terjadi di balik layar ketika pengguna membuat laporan baru:
1. **Interaksi Pengguna:** Pelapor membuka halaman web, mengisi formulir detail kerusakan jalan, mengunggah foto bukti, lalu menekan tombol "Kirim".
2. **Proses Frontend:** Next.js mengemas data tersebut dan menembakkannya (mengirim *HTTP POST request*) ke Backend.
3. **Proses Backend:** Express.js menerima data tersebut. Ia pertama-tama akan mengecek apakah pengguna punya akses sah (lewat pengecekan token JWT/Login). Jika aman, Express.js memerintahkan MySQL untuk menyisipkan data (`INSERT INTO laporan...`).
4. **Penyimpanan:** Database MySQL menyimpan data laporan secara permanen.
5. **Hasil Akhir:** Backend mengirim pesan "Sukses" ke Frontend. Next.js kemudian memunculkan notifikasi berhasil dan otomatis memindahkan pengguna ke halaman daftar laporan mereka.
