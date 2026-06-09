import pool from '../config/db.js';
// Membuat komentar baru
export const createKomentar = async (req, res) => {
    try {
        const { laporanId } = req.params;
        const { isi_komentar } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Akses ditolak. Anda belum login.' });
            return;
        }
        if (!isi_komentar || isi_komentar.trim() === '') {
            res.status(400).json({ message: 'Isi komentar tidak boleh kosong.' });
            return;
        }
        // Pastikan laporan ada
        const [laporan] = await pool.query('SELECT id FROM laporan WHERE id = ?', [laporanId]);
        if (laporan.length === 0) {
            res.status(404).json({ message: 'Laporan tidak ditemukan.' });
            return;
        }
        const komentarId = `COM-${Date.now()}`;
        await pool.query('INSERT INTO komentar (id, laporan_id, user_id, isi_komentar) VALUES (?, ?, ?, ?)', [komentarId, laporanId, userId, isi_komentar]);
        // Ambil data komentar yang baru dimasukkan beserta info user untuk dikembalikan ke client
        const [newComment] = await pool.query(`SELECT k.*, u.nama_lengkap as nama_user, u.role as role_user 
       FROM komentar k 
       JOIN users u ON k.user_id = u.id 
       WHERE k.id = ?`, [komentarId]);
        res.status(201).json({
            message: 'Komentar berhasil ditambahkan!',
            data: newComment[0]
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Gagal menambahkan komentar.', error: error.message });
    }
};
// Mengambil semua komentar untuk laporan tertentu
export const getKomentarByLaporan = async (req, res) => {
    try {
        const { laporanId } = req.params;
        const [comments] = await pool.query(`SELECT k.*, u.nama_lengkap as nama_user, u.role as role_user 
       FROM komentar k 
       JOIN users u ON k.user_id = u.id 
       WHERE k.laporan_id = ? 
       ORDER BY k.created_at ASC`, [laporanId]);
        res.json(comments);
    }
    catch (error) {
        res.status(500).json({ message: 'Gagal mengambil komentar.', error: error.message });
    }
};
// Menghapus komentar
export const deleteKomentar = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (!userId) {
            res.status(401).json({ message: 'Akses ditolak. Anda belum login.' });
            return;
        }
        // Ambil komentar untuk dicek kepemilikannya
        const [comments] = await pool.query('SELECT * FROM komentar WHERE id = ?', [commentId]);
        if (comments.length === 0) {
            res.status(404).json({ message: 'Komentar tidak ditemukan.' });
            return;
        }
        const comment = comments[0];
        if (!comment) {
            res.status(404).json({ message: 'Komentar tidak ditemukan.' });
            return;
        }
        // Boleh dihapus jika: pemilik komentar ATAU admin/super admin
        if (comment.user_id !== userId && userRole !== 'admin' && userRole !== 'super_admin') {
            res.status(403).json({ message: 'Anda tidak memiliki hak untuk menghapus komentar ini.' });
            return;
        }
        const [result] = await pool.query('DELETE FROM komentar WHERE id = ?', [commentId]);
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Komentar tidak ditemukan.' });
            return;
        }
        res.json({ message: 'Komentar berhasil dihapus.' });
    }
    catch (error) {
        res.status(500).json({ message: 'Gagal menghapus komentar.', error: error.message });
    }
};
//# sourceMappingURL=komentarController.js.map