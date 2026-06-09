import { Router } from 'express';
import { getAllUsers, createUser, deleteUser, updateUserRole } from '../controllers/userController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
import type { Response, NextFunction } from 'express';

const router = Router();

// Middleware spesifik hanya untuk super_admin
const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
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
