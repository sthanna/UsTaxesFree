import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { Schedule1Repository } from '../../repositories/schedule1';
import { ReturnService } from '../../services/return';
import { auditAction } from '../middleware/audit';

const router = Router();

router.use(authenticateToken);

// ===== Additional Income Routes =====

router.get('/:returnId/additional-income', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const returnId = parseInt(req.params.returnId);

        // Verify user owns this return
        await ReturnService.getReturnById(userId, returnId);

        const income = await Schedule1Repository.getAdditionalIncome(returnId);
        res.json(income || {});
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:returnId/additional-income', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const returnId = parseInt(req.params.returnId);

        // Verify user owns this return
        await ReturnService.getReturnById(userId, returnId);

        // Check if already exists
        const existing = await Schedule1Repository.getAdditionalIncome(returnId);

        let result;
        if (existing) {
            result = await Schedule1Repository.updateAdditionalIncome(returnId, req.body);
        } else {
            result = await Schedule1Repository.createAdditionalIncome({
                return_id: returnId,
                ...req.body,
            });
        }

        await auditAction(userId, 'UPDATE_SCHEDULE_1_INCOME', {
            returnId,
            entityType: 'schedule_1_income',
            entityId: result.id,
            changes: req.body,
        }, req);

        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/:returnId/additional-income', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const returnId = parseInt(req.params.returnId);

        // Verify user owns this return
        await ReturnService.getReturnById(userId, returnId);

        const result = await Schedule1Repository.updateAdditionalIncome(returnId, req.body);

        await auditAction(userId, 'UPDATE_SCHEDULE_1_INCOME', {
            returnId,
            entityType: 'schedule_1_income',
            entityId: result.id,
            changes: req.body,
        }, req);

        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// ===== Adjustments Routes =====

router.get('/:returnId/adjustments', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const returnId = parseInt(req.params.returnId);

        // Verify user owns this return
        await ReturnService.getReturnById(userId, returnId);

        const adjustments = await Schedule1Repository.getAdjustments(returnId);
        res.json(adjustments || {});
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:returnId/adjustments', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const returnId = parseInt(req.params.returnId);

        // Verify user owns this return
        await ReturnService.getReturnById(userId, returnId);

        // Check if already exists
        const existing = await Schedule1Repository.getAdjustments(returnId);

        let result;
        if (existing) {
            result = await Schedule1Repository.updateAdjustments(returnId, req.body);
        } else {
            result = await Schedule1Repository.createAdjustments({
                return_id: returnId,
                ...req.body,
            });
        }

        await auditAction(userId, 'UPDATE_SCHEDULE_1_ADJUSTMENTS', {
            returnId,
            entityType: 'schedule_1_adjustments',
            entityId: result.id,
            changes: req.body,
        }, req);

        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/:returnId/adjustments', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const returnId = parseInt(req.params.returnId);

        // Verify user owns this return
        await ReturnService.getReturnById(userId, returnId);

        const result = await Schedule1Repository.updateAdjustments(returnId, req.body);

        await auditAction(userId, 'UPDATE_SCHEDULE_1_ADJUSTMENTS', {
            returnId,
            entityType: 'schedule_1_adjustments',
            entityId: result.id,
            changes: req.body,
        }, req);

        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
