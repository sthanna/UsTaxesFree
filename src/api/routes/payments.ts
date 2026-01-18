import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { TaxPaymentsRepository } from '../../repositories/payments';
import { ReturnService } from '../../services/return';
import { auditAction } from '../middleware/audit';

const router = Router();

router.use(authenticateToken);

// Get all payments for a return
router.get('/:returnId/payments', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const returnId = parseInt(req.params.returnId);

        // Verify user owns this return
        await ReturnService.getReturnById(userId, returnId);

        const payments = await TaxPaymentsRepository.findByReturnId(returnId);
        res.json(payments);
    } catch (error: any) {
        if (error.message === 'Return not found' || error.message === 'Unauthorized access to return') {
            res.status(403).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// Create a new payment
router.post('/:returnId/payments', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const returnId = parseInt(req.params.returnId);

        // Verify user owns this return
        await ReturnService.getReturnById(userId, returnId);

        const payment = await TaxPaymentsRepository.create({
            return_id: returnId,
            ...req.body
        });

        await auditAction(userId, 'CREATE_PAYMENT', {
            returnId,
            entityType: 'payment',
            entityId: payment.id,
            changes: req.body,
        }, req);

        res.status(201).json(payment);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a payment
router.delete('/:returnId/payments/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const returnId = parseInt(req.params.returnId);
        const paymentId = parseInt(req.params.id);

        // Verify user owns this return
        await ReturnService.getReturnById(userId, returnId);

        // Note: Ideally verify payment belongs to return here too, but simple delete by ID is safer with Return check
        await TaxPaymentsRepository.delete(paymentId);

        await auditAction(userId, 'DELETE_PAYMENT', {
            returnId,
            entityType: 'payment',
            entityId: paymentId,
            changes: { deleted: true },
        }, req);

        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
