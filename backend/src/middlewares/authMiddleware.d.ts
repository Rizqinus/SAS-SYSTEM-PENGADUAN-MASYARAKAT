import type { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authMiddleware.d.ts.map