import { TaxInput, CalculationResult, FilingStatus, TaxLine, StateTaxResult } from './types';
import { TaxYearRegistry } from './registry';
import { StateRegistry } from './states/registry';
import { TaxMath } from './math';

export class CalculationEngine {
    static run(input: TaxInput, filingStatus: FilingStatus, taxYear: number): CalculationResult {
        const errors: string[] = [];

        // 1. Get Strategy for Year
        const strategy = TaxYearRegistry.getStrategy(taxYear);

        // 2. Run Form 1040
        const f1040Lines = strategy.calculate(input, filingStatus);

        // 3. Aggregate Results
        const allLines = [...f1040Lines];

        // 3. Calculate Refund / Owed
        const totalTax = this.getLineValue(allLines, '1040', '24');
        const totalPayments = this.getLineValue(allLines, '1040', '33');

        // Re-calculate refund and amountOwed based on totalTax and totalPayments
        const amountOwed = TaxMath.max(0, TaxMath.sub(totalTax, totalPayments));
        const refund = TaxMath.max(0, TaxMath.sub(totalPayments, totalTax));

        // 4. State Calculation (Active State: Check input.state or default to NY for MVP POC)
        // In real app, we'd iterate active states.
        let stateResult: StateTaxResult | undefined;
        // 4. State Calculation (Strategy Pattern)
        // Default to NY for now if not provided, or handle empty
        const stateCode = input.residentState || 'NY';
        const stateStrategy = StateRegistry.getStrategy(stateCode);

        if (stateStrategy) {
            const result = stateStrategy.calculate(allLines, input, filingStatus);
            // Simple mock final tax aggregation for state
            const stateTax = result.lines.find(l => l.lineNumber === '39' || l.lineNumber === '12')?.value || 0; // NJ line 39, PA line 12
            stateResult = {
                state: stateCode,
                lines: result.lines,
                amountOwed: stateTax, // Simplified: No withholding logic for state yet
                refund: 0,
                totalTax: result.totalTax
            };
        }

        return {
            taxYear,
            filingStatus,
            lines: allLines,
            refund,
            amountOwed,
            stateResult, // Add stateResult to the return object
            errors
        };
    }

    private static getLineValue(lines: TaxLine[], form: string, lineNum: string): number {
        const line = lines.find(l => l.form === form && l.lineNumber === lineNum);
        return line ? line.value : 0;
    }
}
