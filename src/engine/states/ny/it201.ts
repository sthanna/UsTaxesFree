import { TaxInput, TaxLine, FilingStatus, StateTaxResult } from '../../types';
import { TaxMath } from '../../math';
import { StateTaxStrategy } from '../strategy';

export class FormIT201 implements StateTaxStrategy {
    calculate(federalLines: TaxLine[], input: TaxInput, filingStatus: FilingStatus): StateTaxResult {
        const lines: TaxLine[] = [];

        // 1. Federal AGI (Start point for NY)
        // Find Federal Line 15 (Taxable Income) or re-calc AGI. 
        // For MVP, let's use Federal Taxable Income as a proxy for the starting base, 
        // though real NY starts with Fed AGI (Line 11).

        // Let's assume we find Fed Taxable Income (Line 15) and work back or just use it.
        // Better: Use Total Income calculated in Fed (wages + int + div).
        const wages = federalLines.find(l => l.lineNumber === '1z')?.value || 0;
        const interest = federalLines.find(l => l.lineNumber === '2b')?.value || 0;
        const dividends = federalLines.find(l => l.lineNumber === '3b')?.value || 0;

        const federalAGI = TaxMath.add(wages, interest, dividends);

        lines.push({
            id: 'IT201_fed_agi',
            description: 'Federal AGI (Simulated)',
            value: federalAGI,
            form: 'IT-201',
            lineNumber: '19'
        });

        // 2. NY Standard Deduction
        const nyStdDed = this.getStandardDeduction(filingStatus);
        lines.push({
            id: 'IT201_34',
            description: 'NY Standard Deduction',
            value: nyStdDed,
            form: 'IT-201',
            lineNumber: '34'
        });

        // 3. NY Taxable Income
        const nyTaxable = TaxMath.max(0, TaxMath.sub(federalAGI, nyStdDed));
        lines.push({
            id: 'IT201_37',
            description: 'NY Taxable Income',
            value: nyTaxable,
            form: 'IT-201',
            lineNumber: '37'
        });

        // 4. NY Tax Calculation
        const nyTax = this.calculateTax(nyTaxable, filingStatus);
        lines.push({
            id: 'IT201_39',
            description: 'NY Tax',
            value: nyTax,
            form: 'IT-201',
            lineNumber: '39'
        });

        return {
            state: 'NY',
            lines: lines,
            totalTax: nyTax,
            amountOwed: nyTax, // simplified
            refund: 0
        };
    }

    private getStandardDeduction(status: FilingStatus): number {
        // 2024 NY Standard Deductions
        switch (status) {
            case 'SINGLE': return 8000;
            case 'MARRIED_JOINT': return 16050;
            case 'MARRIED_SEPARATE': return 8000;
            case 'HEAD_OF_HOUSEHOLD': return 11200;
            case 'WIDOW': return 16050;
            default: return 0;
        }
    }

    private calculateTax(income: number, status: FilingStatus): number {
        // Simplified NY Tax (Wait for full tables later)
        // Approx 4-6%
        return TaxMath.mul(income, 0.05);
    }
}
