import { Router } from 'express';
import { getAllUsers, createUser, deleteUser, updateUserRole } from '../controllers/userController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
const router = Router();
// Middleware spesifik hanya untuk super_admin
const requireSuperAdmin = (req, res, next) => {
    if (req.user?.role !== 'super_admin') {
        res.status(403).json({ message: 'Akses ditolak. Hanya Super Admin yang diizinkan mengelola user.' });
        return;
    }
    next();
};
// Semua rute user dilindungi dan hanya untuk super admin
router.use(authenticateToken, requireSuperAdmin);
router.get('/', getAllUsers);
router.post('/', createUser);
router.delete('/:id', deleteUser);
router.put('/:id/role', updateUserRole);
export default router;
//# sourceMappingURL=userRoutes.js.map