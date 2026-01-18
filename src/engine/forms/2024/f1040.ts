import { TaxInput, TaxLine, FilingStatus } from '../../types';
import { TaxMath } from '../../math';
import { TaxFormStrategy } from '../../strategy';

export class Form1040_2024 implements TaxFormStrategy {
    calculate(input: TaxInput, filingStatus: FilingStatus): TaxLine[] {
        const lines: TaxLine[] = [];

        // Line 1z: Wages
        const wages = TaxMath.add(...input.w2s.map(w => w.wages));
        lines.push({
            id: '1040_1z',
            description: 'Wages, salaries, tips, etc.',
            value: wages,
            form: '1040',
            lineNumber: '1z'
        });

        // Line 12: Standard Deduction (2024 Final Values)
        const stdDeduction = this.getStandardDeduction(filingStatus);
        lines.push({
            id: '1040_12',
            description: 'Standard Deduction',
            value: stdDeduction,
            form: '1040',
            lineNumber: '12'
        });

        // Line 15: Taxable Income
        const taxableIncome = TaxMath.max(0, TaxMath.sub(wages, stdDeduction));
        lines.push({
            id: '1040_15',
            description: 'Taxable Income',
            value: taxableIncome,
            form: '1040',
            lineNumber: '15'
        });

        // Line 16: Tax
        const tax = this.calculateTax(taxableIncome, filingStatus);
        lines.push({
            id: '1040_16',
            description: 'Tax',
            value: tax,
            form: '1040',
            lineNumber: '16'
        });

        lines.push({
            id: '1040_24',
            description: 'Total Tax',
            value: tax,
            form: '1040',
            lineNumber: '24'
        });

        const withheld = TaxMath.add(...input.w2s.map(w => w.federalTaxWithheld));
        lines.push({
            id: '1040_25d',
            description: 'Federal income tax withheld',
            value: withheld,
            form: '1040',
            lineNumber: '25d'
        });

        return lines;
    }

    private getStandardDeduction(status: FilingStatus): number {
        // 2024 Actual
        switch (status) {
            case 'SINGLE': return 14600;
            case 'MARRIED_SEPARATE': return 14600;
            case 'MARRIED_JOINT': return 29200;
            case 'WIDOW': return 29200;
            case 'HEAD_OF_HOUSEHOLD': return 21900;
            default: return 0;
        }
    }

    private calculateTax(income: number, status: FilingStatus): number {
        return TaxMath.mul(income, 0.12); // Slightly lower effective rate example
    }
}
