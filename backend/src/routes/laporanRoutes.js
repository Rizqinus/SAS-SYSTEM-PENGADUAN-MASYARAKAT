import { Router } from 'express';
import { createLaporan, getAllLaporan, getLaporanById, updateLaporanStatus, getMyLaporan } from '../controllers/laporanController.js';
import { authenticateToken, requireAdmin } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';
const router = Router();
// Public / User routes
router.get('/', getAllLaporan);
// Rute Laporan Saya (HARUS SEBELUM /:id)
router.get('/my/all', authenticateToken, getMyLaporan);
router.get('/:id', getLaporanById);
router.post('/', authenticateToken, upload.single('foto'), createLaporan);
// Admin routes
router.put('/:id/status', authenticateToken, requireAdmin, updateLaporanStatus);
export default router;
//# sourceMappingURL=laporanRoutes.js.map