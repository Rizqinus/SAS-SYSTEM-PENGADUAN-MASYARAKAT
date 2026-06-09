import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
export declare const createLaporan: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllLaporan: (req: Request, res: Response) => Promise<void>;
export declare const getMyLaporan: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getLaporanById: (req: Request, res: Response) => Promise<void>;
export declare const updateLaporanStatus: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=laporanController.d.ts.map