import { StateTaxStrategy, StateTaxResult } from '../strategy';
import { TaxInput, TaxLine, FilingStatus } from '../../types';
import { TaxMath } from '../../math';

export class FormNJ1040 implements StateTaxStrategy {
    calculate(federalReturn: TaxLine[], input: TaxInput, filingStatus: FilingStatus): StateTaxResult {
        // NJ Gross Income
        // 1. Wages
        const wages = TaxMath.add(...input.w2s.map(w => w.wages));

        // 2. Interest
        const interest = input.taxableInterest;

        // 3. Dividends
        const dividends = input.ordinaryDividends;

        // 4. Net Gains
        // NJ also limits losses. You can deduct losses up to the amount of gains in the same category.
        // For MVP, we'll assume similar logic: if net < 0, it's 0 for income purposes (cannot offset wages).
        let netGain = 0;
        const capGains = input.capitalGainsTransactions || [];
        const totalProceeds = capGains.reduce((sum, t) => TaxMath.add(sum, t.proceeds), 0);
        const totalBasis = capGains.reduce((sum, t) => TaxMath.add(sum, t.costBasis), 0);
        const rawGain = TaxMath.sub(totalProceeds, totalBasis);

        if (rawGain > 0) {
            netGain = rawGain;
        }

        const grossIncome = TaxMath.add(wages, interest, dividends, netGain);

        // Exemptions
        // Single: $1,000
        // Married Joint: $2,000
        let exemptions = 1000;
        if (filingStatus === 'MARRIED_JOINT' || filingStatus === 'WIDOW') {
            exemptions = 2000;
        }

        // Taxable Income
        const taxableIncome = TaxMath.max(0, TaxMath.sub(grossIncome, exemptions));

        // NJ Tax Tables (Simplified 2024 Single/MJ rates)
        // This is a VERY simplified bracket set for POC
        // 1.4% up to 20k
        // 1.75% > 20k - 35k
        // 3.5% > 35k - 40k
        // 5.525% > 40k - 75k
        // 6.37% > 75k

        let tax = 0;
        if (taxableIncome <= 20000) {
            tax = TaxMath.mul(taxableIncome, 0.014);
        } else if (taxableIncome <= 35000) {
            tax = TaxMath.add(280, TaxMath.mul(taxableIncome - 20000, 0.0175));
        } else if (taxableIncome <= 40000) {
            tax = TaxMath.add(542.50, TaxMath.mul(taxableIncome - 35000, 0.035));
        } else if (taxableIncome <= 75000) {
            tax = TaxMath.add(717.50, TaxMath.mul(taxableIncome - 40000, 0.05525));
        } else {
            tax = TaxMath.add(2651.25, TaxMath.mul(taxableIncome - 75000, 0.0637));
        }

        return {
            state: 'NJ',
            totalTax: tax,
            lines: [
                { id: 'NJ_1', description: 'Wages', value: wages, form: 'NJ-1040', lineNumber: '15' },
                { id: 'NJ_2', description: 'Interest', value: interest, form: 'NJ-1040', lineNumber: '16' },
                { id: 'NJ_29', description: 'Total Gross Income', value: grossIncome, form: 'NJ-1040', lineNumber: '29' },
                { id: 'NJ_30', description: 'Total Exemptions', value: exemptions, form: 'NJ-1040', lineNumber: '30' },
                { id: 'NJ_39', description: 'Total Tax', value: tax, form: 'NJ-1040', lineNumber: '39' }
            ]
        };
    }
}
