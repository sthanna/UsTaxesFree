import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { ReturnService } from '../../services/return';
import { auditAction } from '../middleware/audit';

const router = Router();

router.use(authenticateToken);

// Get all returns for the logged-in user
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const returns = await ReturnService.getUserReturns(userId);
        res.json(returns);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new return
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const { taxYear, filingStatus } = req.body;

        if (!taxYear || !filingStatus) {
            res.status(400).json({ error: 'taxYear and filingStatus are required' });
            return;
        }

        const newReturn = await ReturnService.createReturn(userId, taxYear, filingStatus);

        // Audit log
        await auditAction(userId, 'CREATE_RETURN', {
            returnId: newReturn.id,
            entityType: 'return',
            entityId: newReturn.id,
            changes: { taxYear, filingStatus },
        }, req);

        res.status(201).json(newReturn);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Get a specific return
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const returnId = parseInt(req.params.id);
        const taxReturn = await ReturnService.getReturnById(userId, returnId);
        res.json(taxReturn);
    } catch (error: any) {
        if (error.message === 'Return not found') {
            res.status(404).json({ error: error.message });
        } else if (error.message === 'Unauthorized access to return') {
            res.status(403).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

export default router;
