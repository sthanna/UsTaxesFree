import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { ReturnService } from '../../services/return';
import { CalculationEngine } from '../../engine/calculator';
import { TaxInput, FilingStatus } from '../../engine/types';
import { W2Repository } from '../../repositories/w2';
import { Form1099Repository } from '../../repositories/form1099';
import { Form1099BRepository } from '../../repositories/form1099b';
import { TaxMath } from '../../engine/math';
import { MeFGenerator } from '../../efile/generator';
import { UserRepository } from '../../repositories/user';

const router = Router();

router.use(authenticateToken);

// GET /returns/:id/efile - Unload the XML Return
router.get('/:id/efile', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const returnId = parseInt(req.params.id);

        // 1. Fetch Return & User
        const taxReturn = await ReturnService.getReturnById(userId, returnId);
        const user = await UserRepository.findById(userId);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // 2. Build Input (Re-calculate to ensure fresh data)
        const w2s = await W2Repository.findByReturnId(returnId);
        const intForms = await Form1099Repository.findIntByReturnId(returnId);
        const divForms = await Form1099Repository.findDivByReturnId(returnId);
        const stockForms = await Form1099BRepository.findByReturnId(returnId);

        const totalInterest = TaxMath.add(...intForms.map(f => f.amount));
        const totalDividends = TaxMath.add(...divForms.map(f => f.amount));

        const input: TaxInput = {
            w2s: w2s,
            taxableInterest: totalInterest,
            ordinaryDividends: totalDividends,
            capitalGainsTransactions: stockForms,
            additionalIncome: 0,
            adjustments: 0,
            dependents: [],
            taxPayments: 0
            // Note: MeF XML usually federal only for this generator, ignoring state override
        };

        // 3. Run Calculation
        const result = CalculationEngine.run(
            input,
            taxReturn.filing_status as FilingStatus,
            taxReturn.tax_year
        );

        // 4. Generate XML
        const xml = MeFGenerator.generate(result, user);

        // 5. Send Response
        res.header('Content-Type', 'application/xml');
        res.header('Content-Disposition', `attachment; filename="return-${returnId}-efile.xml"`);
        res.send(xml);

    } catch (error: any) {
        console.error('E-File Error:', error);
        res.status(500).json({ error: 'E-File generation failed', details: error.message });
    }
});

export default router;
