-- Buat Database jika belum ada
CREATE DATABASE IF NOT EXISTS db_Sistem_Pengaduan_Infrastruktur_Jalan;
USE db_Sistem_Pengaduan_Infrastruktur_Jalan;

drop database db_Sistem_Pengaduan_Infrastruktur_Jalan;

-- Tabel Users
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

-- Tabel Categories
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    nama_kategori VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Laporan
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


-- Tabel Komentar
CREATE TABLE IF NOT EXISTS komentar (
    id VARCHAR(50) PRIMARY KEY,
    laporan_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    isi_komentar TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (laporan_id) REFERENCES laporan(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Data Dummy Kategori
INSERT INTO categories (id, nama_kategori) VALUES 
('CAT-001', 'Jalan Berlubang'),
('CAT-002', 'Jalan Retak/Amblas'),
('CAT-003', 'Jembatan Rusak'),
('CAT-004', 'Drainase/Banjir'),
('CAT-005', 'Fasilitas Pejalan Kaki')
ON DUPLICATE KEY UPDATE nama_kategori=nama_kategori;

-- Data Dummy Super Admin
INSERT INTO users (id, nik, nama_lengkap, email, password, role, no_telp) 
VALUES ('SUP-001', '0000000000000000', 'Super Admin Utama', 'super@spj.go.id', '$2b$10$.RCmZNfmcoNtD8bx483LY.OH3fvAWbIOO9EZcPWRTqR7QcSHvQXnS', 'super_admin', '081234567890')
ON DUPLICATE KEY UPDATE email=email;

-- Data Dummy Admin Biasa (Password: admin123)
INSERT INTO users (id, nik, nama_lengkap, email, password, role, no_telp) 
VALUES ('ADM-001', '1111222233334444', 'Admin Utama', 'admin@spj.go.id', '$2b$10$77Q15U2tr7via9WkdO8AEeoRFy2RuDMUUJtJJyCD4bEZqC.QKzQeW', 'admin', '08111222333')
ON DUPLICATE KEY UPDATE email=email;

select * from users;
