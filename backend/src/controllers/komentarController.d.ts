import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
export declare const createKomentar: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getKomentarByLaporan: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteKomentar: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=komentarController.d.ts.map