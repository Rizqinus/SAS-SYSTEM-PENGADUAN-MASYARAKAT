import { Router } from 'express';
import pool from '../config/db.js';
const router = Router();
// Get all categories
router.get('/', async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM categories ORDER BY nama_kategori ASC');
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ message: 'Gagal mengambil kategori', error: error.message });
    }
});
export default router;
//# sourceMappingURL=categoryRoutes.js.map