import { TaxInput, TaxLine } from '../../types';
import { TaxMath } from '../../math';

export class FormScheduleB_2025 {
    static calculate(input: TaxInput): TaxLine[] {
        const lines: TaxLine[] = [];

        // Part I: Interest
        // Line 4: Sum of all interest
        // For MVP we just take the aggregated input, but real world sums 1099-INTs
        const totalInterest = input.taxableInterest || 0;

        lines.push({
            id: 'SchB_4',
            description: 'Total Interest',
            value: totalInterest,
            form: 'Schedule B',
            lineNumber: '4'
        });

        // Part II: Ordinary Dividends
        // Line 6: Sum of all ordinary dividends
        const totalDividends = input.ordinaryDividends || 0;

        lines.push({
            id: 'SchB_6',
            description: 'Total Ordinary Dividends',
            value: totalDividends,
            form: 'Schedule B',
            lineNumber: '6'
        });

        return lines;
    }
}
