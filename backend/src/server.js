import express from "express";
import cors from "cors";
import path from "path";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import laporanRoutes from "./routes/laporanRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import komentarRoutes from "./routes/komentarRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Setup static folder for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/laporan", laporanRoutes);
app.use("/api/laporan", komentarRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        res.json({
            message: "Backend berjalan! Terkoneksi ke MySQL dengan baik.",
            dbTest: rows
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Backend berjalan, tapi GAGAL konek ke MySQL.",
            error: error.message
        });
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Server berjalan di port ${PORT}`);
    try {
        const connection = await pool.getConnection();
        console.log("✅ Berhasil terkoneksi ke database MySQL!");
        // Auto-create categories table if it doesn't exist
        await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(50) PRIMARY KEY,
        nama_kategori VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
        console.log("✅ Tabel database 'categories' berhasil divalidasi/dibuat.");
        // Seed categories if empty
        const [catCount] = await connection.query("SELECT COUNT(*) as count FROM categories");
        if (catCount[0] && catCount[0].count === 0) {
            await connection.query(`
        INSERT INTO categories (id, nama_kategori) VALUES 
        ('CAT-001', 'Jalan Berlubang'),
        ('CAT-002', 'Jalan Retak/Amblas'),
        ('CAT-003', 'Jembatan Rusak'),
        ('CAT-004', 'Drainase/Banjir'),
        ('CAT-005', 'Fasilitas Pejalan Kaki')
      `);
            console.log("✅ Data dummy categories berhasil dimasukkan.");
        }
        // Auto-update 'laporan' table columns if missing
        try {
            const [columns] = await connection.query("SHOW COLUMNS FROM laporan");
            const columnNames = columns.map(col => col.Field);
            if (!columnNames.includes('category_id')) {
                await connection.query("ALTER TABLE laporan ADD COLUMN category_id VARCHAR(50) NULL");
                // Set default category for safety
                await connection.query("UPDATE laporan SET category_id = 'CAT-001' WHERE category_id IS NULL");
                await connection.query("ALTER TABLE laporan MODIFY COLUMN category_id VARCHAR(50) NOT NULL");
                // Add foreign key
                try {
                    await connection.query("ALTER TABLE laporan ADD CONSTRAINT fk_laporan_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE");
                }
                catch (fkErr) {
                    console.log("Foreign Key constraint info:", fkErr.message);
                }
                console.log("✅ Kolom 'category_id' dan relasi asing berhasil ditambahkan ke tabel laporan.");
            }
            if (columnNames.includes('latitude')) {
                await connection.query("ALTER TABLE laporan DROP COLUMN latitude");
                console.log("🗑️ Kolom 'latitude' dibuang dari database karena tidak digunakan.");
            }
            if (columnNames.includes('longitude')) {
                await connection.query("ALTER TABLE laporan DROP COLUMN longitude");
                console.log("🗑️ Kolom 'longitude' dibuang dari database karena tidak digunakan.");
            }
        }
        catch (migError) {
            console.error("❌ Gagal melakukan auto-migrasi tabel laporan:", migError.message);
        }
        // Auto-create komentar table if it doesn't exist
        await connection.query(`
      CREATE TABLE IF NOT EXISTS komentar (
        id VARCHAR(50) PRIMARY KEY,
        laporan_id VARCHAR(50) NOT NULL,
        user_id VARCHAR(50) NOT NULL,
        isi_komentar TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (laporan_id) REFERENCES laporan(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
        console.log("✅ Tabel database 'komentar' berhasil divalidasi/dibuat.");
        connection.release();
    }
    catch (error) {
        console.error("❌ Gagal terkoneksi ke database MySQL:", error.message);
    }
});
//# sourceMappingURL=server.js.map