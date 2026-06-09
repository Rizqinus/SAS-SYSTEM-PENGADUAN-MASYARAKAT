import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_super_aman_123';
export const register = async (req, res) => {
    try {
        const { nik, nama_lengkap, email, password, no_telp } = req.body;
        // Check if user already exists
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE nik = ? OR email = ?', [nik, email]);
        if (existingUsers.length > 0) {
            res.status(400).json({ message: 'NIK atau Email sudah terdaftar!' });
            return;
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = `USR-${Date.now()}`;
        await pool.query('INSERT INTO users (id, nik, nama_lengkap, email, password, no_telp) VALUES (?, ?, ?, ?, ?, ?)', [userId, nik, nama_lengkap, email, hashedPassword, no_telp]);
        res.status(201).json({ message: 'Registrasi berhasil! Silakan login.' });
    }
    catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
    }
};
export const login = async (req, res) => {
    try {
        // Frontend mengirim 'email' untuk identifier (bisa berisi NIK atau Email)
        const { email, password } = req.body;
        // Cari user berdasarkan email ATAU nik
        const [users] = await pool.query('SELECT * FROM users WHERE email = ? OR nik = ?', [email, email]);
        if (users.length === 0) {
            res.status(400).json({ message: 'Email atau NIK tidak ditemukan!' });
            return;
        }
        const user = users[0];
        if (!user) {
            res.status(400).json({ message: 'Email atau NIK tidak ditemukan!' });
            return;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: 'Password salah!' });
            return;
        }
        const token = jwt.sign({ id: user.id, role: user.role, nama: user.nama_lengkap }, JWT_SECRET, { expiresIn: '24h' });
        res.json({
            message: 'Login berhasil!',
            token,
            user: {
                id: user.id,
                nama_lengkap: user.nama_lengkap,
                role: user.role,
                avatar_url: user.avatar_url
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
    }
};
//# sourceMappingURL=authController.js.map