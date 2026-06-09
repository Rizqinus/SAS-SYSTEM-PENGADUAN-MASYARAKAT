import type { Request, Response } from 'express';
import pool from '../config/db.js';
import type { RowDataPacket } from 'mysql2';
import type { AuthRequest } from '../middlewares/authMiddleware.js';

export const createLaporan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { judul, deskripsi, lokasi_jalan, tingkat_kerusakan, category_id } = req.body;
    const pelapor_id = req.user?.id;

    if (!pelapor_id) {
      res.status(401).json({ message: 'Akses ditolak. Anda belum login.' });
      return;
    }

    if (!category_id) {
      res.status(400).json({ message: 'Kategori laporan harus dipilih.' });
      return;
    }

    const foto_url = req.file ? `/uploads/${req.file.filename}` : null;
    const laporan_id = `LAP-${Date.now()}`;

    await pool.query(
      `INSERT INTO laporan (id, pelapor_id, category_id, judul, deskripsi, lokasi_jalan, tingkat_kerusakan, foto_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        laporan_id,
        pelapor_id,
        category_id,
        judul,
        deskripsi,
        lokasi_jalan,
        tingkat_kerusakan,
        foto_url
      ]
    );

    res.status(201).json({ message: 'Laporan berhasil dibuat!', id: laporan_id });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat laporan.', error: (error as Error).message });
  }
};

export const getAllLaporan = async (req: Request, res: Response): Promise<void> => {
  try {
    const [laporan] = await pool.query<RowDataPacket[]>(
      `SELECT l.*, u.nama_lengkap as nama_pelapor, c.nama_kategori 
       FROM laporan l 
       JOIN users u ON l.pelapor_id = u.id 
       LEFT JOIN categories c ON l.category_id = c.id
       ORDER BY l.created_at DESC`
    );
    res.json(laporan);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data laporan.', error: (error as Error).message });
  }
};

export const getMyLaporan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const [laporan] = await pool.query<RowDataPacket[]>(`
      SELECT l.*, u.nama_lengkap as nama_pelapor, c.nama_kategori 
      FROM laporan l 
      JOIN users u ON l.pelapor_id = u.id 
      LEFT JOIN categories c ON l.category_id = c.id
      WHERE l.pelapor_id = ?
      ORDER BY l.created_at DESC
    `, [userId]);
    res.json(laporan);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data laporan saya.', error: (error as Error).message });
  }
};

export const getLaporanById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT l.*, u.nama_lengkap as nama_pelapor, c.nama_kategori 
       FROM laporan l 
       JOIN users u ON l.pelapor_id = u.id 
       LEFT JOIN categories c ON l.category_id = c.id
       WHERE l.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: 'Laporan tidak ditemukan' });
      return;
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil detail laporan', error: (error as Error).message });
  }
};

export const updateLaporanStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query('UPDATE laporan SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Status laporan berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui status', error: (error as Error).message });
  }
};
