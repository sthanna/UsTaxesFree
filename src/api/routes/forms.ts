import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { ReturnService } from '../../services/return';
import { W2Repository } from '../../repositories/w2';
import { Form1099Repository } from '../../repositories/form1099';
import { Form1099BRepository } from '../../repositories/form1099b';

const router = Router();
router.use(authenticateToken);

// Helper to validate return access (TODO: Move to service middleware)
const validateAccess = async (req: AuthRequest, returnId: number) => {
    await ReturnService.getReturnById(req.user.id, returnId);
};

// POST /returns/:id/w2
router.post('/:id/w2', async (req: AuthRequest, res: Response) => {
    try {
        const returnId = parseInt(req.params.id);
        await validateAccess(req, returnId);

        const { employer, wages, federalTaxWithheld } = req.body;
        const w2 = await W2Repository.create(returnId, { employer, wages, federalTaxWithheld });
        res.json(w2);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /returns/:id/1099-int
router.post('/:id/1099-int', async (req: AuthRequest, res: Response) => {
    try {
        const returnId = parseInt(req.params.id);
        await validateAccess(req, returnId);

        const { payer, amount } = req.body;
        const form = await Form1099Repository.createInt(returnId, payer, amount);
        res.json(form);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /returns/:id/1099-div
router.post('/:id/1099-div', async (req: AuthRequest, res: Response) => {
    try {
        const returnId = parseInt(req.params.id);
        await validateAccess(req, returnId);

        const { payer, amount } = req.body;
        const form = await Form1099Repository.createDiv(returnId, payer, amount);
        res.json(form);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /returns/:id/1099-b
router.post('/:id/1099-b', async (req: AuthRequest, res: Response) => {
    try {
        const returnId = parseInt(req.params.id);
        await validateAccess(req, returnId);

        const { description, proceeds, costBasis, isLongTerm } = req.body;
        const form = await Form1099BRepository.create(returnId, { description, proceeds, costBasis, isLongTerm });
        res.json(form);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
