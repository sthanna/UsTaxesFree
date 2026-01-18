import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { DependentsRepository } from '../../repositories/dependents';
import { ReturnService } from '../../services/return';
import { auditAction } from '../middleware/audit';

const router = Router();

router.use(authenticateToken);

// Get all dependents for a return
router.get('/:returnId/dependents', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const returnId = parseInt(req.params.returnId);

        // Verify user owns this return
        await ReturnService.getReturnById(userId, returnId);

        const dependents = await DependentsRepository.findByReturnId(returnId);
        res.json(dependents);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific dependent
router.get('/:returnId/dependents/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const returnId = parseInt(req.params.returnId);
        const dependentId = parseInt(req.params.id);

        // Verify user owns this return
        await ReturnService.getReturnById(userId, returnId);

        const dependent = await DependentsRepository.findById(dependentId);
        if (!dependent || dependent.return_id !== returnId) {
            res.status(404).json({ error: 'Dependent not found' });
            return;
        }

        res.json(dependent);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new dependent
router.post('/:returnId/dependents', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const returnId = parseInt(req.params.returnId);

        // Verify user owns this return
        await ReturnService.getReturnById(userId, returnId);

        const dependent = await DependentsRepository.create({
            return_id: returnId,
            ...req.body,
        });

        await auditAction(userId, 'CREATE_DEPENDENT', {
            returnId,
            entityType: 'dependent',
            entityId: dependent.id,
            changes: req.body,
        }, req);

        res.status(201).json(dependent);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Update a dependent
router.put('/:returnId/dependents/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const returnId = parseInt(req.params.returnId);
        const dependentId = parseInt(req.params.id);

        // Verify user owns this return
        await ReturnService.getReturnById(userId, returnId);

        // Verify dependent belongs to this return
        const existing = await DependentsRepository.findById(dependentId);
        if (!existing || existing.return_id !== returnId) {
            res.status(404).json({ error: 'Dependent not found' });
            return;
        }

        const updated = await DependentsRepository.update(dependentId, req.body);

        await auditAction(userId, 'UPDATE_DEPENDENT', {
            returnId,
            entityType: 'dependent',
            entityId: dependentId,
            changes: req.body,
        }, req);

        res.json(updated);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a dependent
router.delete('/:returnId/dependents/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const returnId = parseInt(req.params.returnId);
        const dependentId = parseInt(req.params.id);

        // Verify user owns this return
        await ReturnService.getReturnById(userId, returnId);

        // Verify dependent belongs to this return
        const existing = await DependentsRepository.findById(dependentId);
        if (!existing || existing.return_id !== returnId) {
            res.status(404).json({ error: 'Dependent not found' });
            return;
        }

        await DependentsRepository.delete(dependentId);

        await auditAction(userId, 'DELETE_DEPENDENT', {
            returnId,
            entityType: 'dependent',
            entityId: dependentId,
            changes: { deleted: true },
        }, req);

        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
