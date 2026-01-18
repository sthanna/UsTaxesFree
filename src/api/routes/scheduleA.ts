import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { ReturnService } from '../../services/return';
import { ScheduleARepository } from '../../repositories/scheduleA';

const router = Router();

router.use(authenticateToken);

// Get Schedule A
router.get('/:id/schedule-a', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const returnId = parseInt(req.params.id);

        await ReturnService.getReturnById(userId, returnId); // Auth check

        const data = await ScheduleARepository.findByReturnId(returnId);
        res.json(data || {});
    } catch (error: any) {
        if (error.message === 'Return not found' || error.message === 'Unauthorized access to return') {
            res.status(403).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Failed to fetch Schedule A' });
        }
    }
});

// Update Schedule A
router.post('/:id/schedule-a', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const returnId = parseInt(req.params.id);

        await ReturnService.getReturnById(userId, returnId); // Auth check

        await ScheduleARepository.upsert(returnId, req.body);
        res.status(200).json({ message: 'Schedule A updated' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update Schedule A' });
    }
});

export default router;
