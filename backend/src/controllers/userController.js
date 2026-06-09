import bcrypt from 'bcrypt';
import pool from '../config/db.js';
export const getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, nik, nama_lengkap, email, role, no_telp, avatar_url, created_at FROM users ORDER BY created_at DESC');
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data user.', error: error.message });
    }
};
export const createUser = async (req, res) => {
    try {
        const { nik, nama_lengkap, email, password, no_telp, role } = req.body;
        const validRoles = ['user', 'admin', 'super_admin'];
        if (!validRoles.includes(role)) {
            res.status(400).json({ message: 'Role tidak valid.' });
            return;
        }
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE nik = ? OR email = ?', [nik, email]);
        if (existingUsers.length > 0) {
            res.status(400).json({ message: 'NIK atau Email sudah terdaftar!' });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = `USR-${Date.now()}`;
        await pool.query('INSERT INTO users (id, nik, nama_lengkap, email, password, role, no_telp) VALUES (?, ?, ?, ?, ?, ?, ?)', [userId, nik, nama_lengkap, email, hashedPassword, role, no_telp]);
        res.status(201).json({ message: 'User berhasil ditambahkan!' });
    }
    catch (error) {
        res.status(500).json({ message: 'Gagal menambahkan user.', error: error.message });
    }
};
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Prevent deleting the main super admin (SUP-001)
        if (id === 'SUP-001') {
            res.status(403).json({ message: 'Tidak dapat menghapus Super Admin Utama!' });
            return;
        }
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'User tidak ditemukan.' });
            return;
        }
        res.json({ message: 'User berhasil dihapus.' });
    }
    catch (error) {
        res.status(500).json({ message: 'Gagal menghapus user.', error: error.message });
    }
};
export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (id === 'SUP-001') {
            res.status(403).json({ message: 'Tidak dapat mengubah role Super Admin Utama!' });
            return;
        }
        const validRoles = ['user', 'admin', 'super_admin'];
        if (!validRoles.includes(role)) {
            res.status(400).json({ message: 'Role tidak valid.' });
            return;
        }
        const [result] = await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'User tidak ditemukan.' });
            return;
        }
        res.json({ message: 'Role berhasil diperbarui.' });
    }
    catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui role.', error: error.message });
    }
};
//# sourceMappingURL=userController.js.map