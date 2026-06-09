import { Router } from 'express';
import { createKomentar, getKomentarByLaporan, deleteKomentar } from '../controllers/komentarController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
const router = Router();
// Rute untuk komentar (berbasis laporanId)
// Mengambil semua komentar untuk suatu laporan (Public)
router.get('/:laporanId/komentar', getKomentarByLaporan);
// Menambahkan komentar baru untuk suatu laporan (Auth)
router.post('/:laporanId/komentar', authenticateToken, createKomentar);
// Menghapus komentar tertentu (Auth)
router.delete('/:laporanId/komentar/:commentId', authenticateToken, deleteKomentar);
export default router;
//# sourceMappingURL=komentarRoutes.js.map