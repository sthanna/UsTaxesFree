import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { ReturnService } from '../../services/return';
import { CalculationEngine } from '../../engine/calculator';
import { TaxInput, FilingStatus } from '../../engine/types';
import { W2Repository } from '../../repositories/w2';
import { Form1099Repository } from '../../repositories/form1099';
import { Form1099BRepository } from '../../repositories/form1099b';
import { DependentsRepository } from '../../repositories/dependents';
import { Schedule1Repository } from '../../repositories/schedule1';
import { TaxPaymentsRepository } from '../../repositories/payments';
import { ScheduleARepository } from '../../repositories/scheduleA';
import { TaxMath } from '../../engine/math';

const router = Router();

router.use(authenticateToken);

// Trigger a calculation for a specific return
router.post('/:id/calculate', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const returnId = parseInt(req.params.id);

        // 1. Fetch Return Data from DB (Validation + Authorization)
        const taxReturn = await ReturnService.getReturnById(userId, returnId);

        // 2. Build Input Object from DB
        const w2s = await W2Repository.findByReturnId(returnId);
        const intForms = await Form1099Repository.findIntByReturnId(returnId);
        const divForms = await Form1099Repository.findDivByReturnId(returnId);
        const stockForms = await Form1099BRepository.findByReturnId(returnId);
        const dependents = await DependentsRepository.findByReturnId(returnId);

        const sch1Income = await Schedule1Repository.getAdditionalIncome(returnId);
        const sch1Adj = await Schedule1Repository.getAdjustments(returnId);
        const payments = await TaxPaymentsRepository.findByReturnId(returnId);
        const scheduleA = await ScheduleARepository.findByReturnId(returnId); // Fetch Schedule A

        // Aggregate Interest and Dividends
        const totalInterest = TaxMath.add(...intForms.map(f => f.amount));
        const totalDividends = TaxMath.add(...divForms.map(f => f.amount));

        // Aggregate Payments
        const totalEstimatedPayments = TaxMath.add(...payments
            .filter(p => p.payment_type !== 'withholding')
            .map(p => Number(p.amount)));

        // Aggregate Schedule 1 Income
        let additionalIncome = 0;
        if (sch1Income) {
            additionalIncome = TaxMath.add(
                sch1Income.taxable_refunds_credits || 0,
                sch1Income.alimony_received || 0,
                sch1Income.business_income || 0,
                sch1Income.other_gains_losses || 0,
                sch1Income.rental_income || 0,
                sch1Income.farm_income || 0,
                sch1Income.unemployment_compensation || 0,
                sch1Income.other_income_amount || 0
            );
        }

        // Aggregate Schedule 1 Adjustments
        let adjustments = 0;
        if (sch1Adj) {
            adjustments = TaxMath.add(
                sch1Adj.educator_expenses || 0,
                sch1Adj.business_expenses || 0,
                sch1Adj.health_savings_account || 0,
                sch1Adj.moving_expenses || 0,
                sch1Adj.self_employment_sep || 0,
                sch1Adj.self_employment_health || 0,
                sch1Adj.penalty_early_withdrawal || 0,
                sch1Adj.alimony_paid || 0,
                sch1Adj.ira_deduction || 0,
                sch1Adj.student_loan_interest || 0,
                sch1Adj.tuition_fees || 0,
                sch1Adj.other_adjustments_amount || 0
            );
        }

        const input: TaxInput = {
            w2s: w2s,
            taxableInterest: totalInterest,
            ordinaryDividends: totalDividends,
            capitalGainsTransactions: stockForms,
            additionalIncome: additionalIncome,
            adjustments: adjustments,
            dependents: dependents,
            taxPayments: totalEstimatedPayments,
            itemizedDeductions: scheduleA ? {
                medicalExpenses: Number(scheduleA.medical_expenses),
                stateLocalIncomeTaxes: Number(scheduleA.state_local_income_taxes),
                realEstateTaxes: Number(scheduleA.real_estate_taxes),
                personalPropertyTaxes: Number(scheduleA.personal_property_taxes),
                mortgageInterest: Number(scheduleA.mortgage_interest),
                charitableContributionsCash: Number(scheduleA.charitable_contributions_cash),
                charitableContributionsNoncash: Number(scheduleA.charitable_contributions_noncash),
                casualtyLosses: Number(scheduleA.casualty_losses)
            } : undefined,
            residentState: req.body.residentState // Optional override from request
        };

        // 3. Run Calculation Engine
        try {
            const result = CalculationEngine.run(
                input,
                taxReturn.filing_status as FilingStatus,
                taxReturn.tax_year
            );
            // 4. Update Return in DB (TODO: Save result blob)
            // For now, just return the result
            res.json(result);
        } catch (engineError) {
            console.error('Engine Error:', engineError);
            throw engineError;
        }

    } catch (error: any) {
        if (error.message === 'Return not found') {
            res.status(404).json({ error: error.message });
        } else if (error.message === 'Unauthorized access to return') {
            res.status(403).json({ error: error.message });
        } else {
            console.error('Calculation Error:', error);
            res.status(500).json({ error: 'Calculation failed', details: error.message });
        }
    }
});

export default router;
