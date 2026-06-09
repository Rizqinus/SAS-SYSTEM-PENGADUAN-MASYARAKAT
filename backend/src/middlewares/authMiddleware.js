import jwt from 'jsonwebtoken';
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_super_aman_123');
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(403).json({ message: 'Token tidak valid atau kedaluwarsa.' });
    }
};
export const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
        res.status(403).json({ message: 'Akses ditolak. Hanya admin yang diizinkan.' });
        return;
    }
    next();
};
//# sourceMappingURL=authMiddleware.js.map