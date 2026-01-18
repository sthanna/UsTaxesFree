import { StateTaxStrategy, StateTaxResult } from '../strategy';
import { TaxInput, TaxLine, FilingStatus } from '../../types';
import { TaxMath } from '../../math';

export class FormPA40 implements StateTaxStrategy {
    calculate(federalReturn: TaxLine[], input: TaxInput, filingStatus: FilingStatus): StateTaxResult {
        // PA Income Classes (Simplified for MVP)
        // 1. Compensation (Wages)
        const compensation = TaxMath.add(...input.w2s.map(w => w.wages));

        // 2. Interest
        const interest = input.taxableInterest;

        // 3. Dividends
        const dividends = input.ordinaryDividends;

        // 4. Net Gains form Property (Schedule D)
        // PA does NOT allow losses in one class to offset another.
        // PA also does NOT allow a net loss in the Gains class (min 0).
        // We need to re-calculate gain specifically for PA rules, but for MVP we will take the Federal Net Gain if positive.
        // If Federal shows a loss (e.g. -3000 input), PA treats this as 0.
        // NOTE: Strictly, PA has different basis rules, but we assume Fed amounts for MVP.
        let netGain = 0;
        const capGains = input.capitalGainsTransactions || [];

        // Calculate PA Gain (Aggregate all transactions, if net < 0 then 0)
        // PA doesn't distinguish ST vs LT for rate, but aggregates them.
        const totalProceeds = capGains.reduce((sum, t) => TaxMath.add(sum, t.proceeds), 0);
        const totalBasis = capGains.reduce((sum, t) => TaxMath.add(sum, t.costBasis), 0);
        const rawGain = TaxMath.sub(totalProceeds, totalBasis);

        if (rawGain > 0) {
            netGain = rawGain;
        }

        // Total PA Taxable Income
        const totalIncome = TaxMath.add(compensation, interest, dividends, netGain);

        // Tax Calculation (Flat 3.07%)
        const tax = TaxMath.mul(totalIncome, 0.0307);

        return {
            state: 'PA',
            totalTax: tax,
            lines: [
                { id: 'PA_1', description: 'Compensation', value: compensation, form: 'PA-40', lineNumber: '1a' },
                { id: 'PA_2', description: 'Interest', value: interest, form: 'PA-40', lineNumber: '2' },
                { id: 'PA_3', description: 'Dividends', value: dividends, form: 'PA-40', lineNumber: '3' },
                { id: 'PA_4', description: 'Net Gains', value: netGain, form: 'PA-40', lineNumber: '4' },
                { id: 'PA_9', description: 'Total PA Taxable Income', value: totalIncome, form: 'PA-40', lineNumber: '9' },
                { id: 'PA_12', description: 'PA Tax Liability (3.07%)', value: tax, form: 'PA-40', lineNumber: '12' }
            ]
        };
    }
}
