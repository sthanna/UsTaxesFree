import { TaxInput, TaxLine, FilingStatus } from '../../types';
import { TaxMath } from '../../math';
import { TaxFormStrategy } from '../../strategy';
import { FormScheduleB_2025 } from './scheduleB';
import { FormScheduleD_2025 } from './scheduleD';
import { ScheduleA2025 } from './scheduleA';

export class Form1040_2025 implements TaxFormStrategy {
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

        // Schedule B: Interest & Dividends
        const schBLines = FormScheduleB_2025.calculate(input);
        lines.push(...schBLines);

        // Line 2b: Taxable Interest
        const taxableInterest = schBLines.find(l => l.lineNumber === '4')?.value || 0;
        lines.push({
            id: '1040_2b',
            description: 'Taxable Interest',
            value: taxableInterest,
            form: '1040',
            lineNumber: '2b'
        });

        // Line 3b: Ordinary Dividends
        const ordinaryDividends = schBLines.find(l => l.lineNumber === '6')?.value || 0;
        lines.push({
            id: '1040_3b',
            description: 'Ordinary Dividends',
            value: ordinaryDividends,
            form: '1040',
            lineNumber: '3b'
        });

        // Schedule D: Capital Gains
        const schDLines = FormScheduleD_2025.calculate(input);
        lines.push(...schDLines);

        const capitalGainLoss = schDLines.find(l => l.lineNumber === '16')?.value || 0;
        lines.push({
            id: '1040_7',
            description: 'Capital Gain/Loss',
            value: capitalGainLoss,
            form: '1040',
            lineNumber: '7'
        });

        // Schedule 1: Additional Income (Line 8)
        const additionalIncome = input.additionalIncome || 0;
        lines.push({
            id: '1040_8',
            description: 'Other Income from Schedule 1',
            value: additionalIncome,
            form: '1040',
            lineNumber: '8'
        });

        // Total Income (Line 9) (Wages + Int + Div + CapGain + Sch1)
        const totalIncome = TaxMath.add(wages, taxableInterest, ordinaryDividends, capitalGainLoss, additionalIncome);
        lines.push({
            id: '1040_9',
            description: 'Total Income',
            value: totalIncome,
            form: '1040',
            lineNumber: '9'
        });

        // Schedule 1: Adjustments (Line 10)
        const adjustments = input.adjustments || 0;
        lines.push({
            id: '1040_10',
            description: 'Adjustments from Schedule 1',
            value: adjustments,
            form: '1040',
            lineNumber: '10'
        });

        // Adjusted Gross Income (Line 11)
        const agi = TaxMath.max(0, TaxMath.sub(totalIncome, adjustments));
        lines.push({
            id: '1040_11',
            description: 'Adjusted Gross Income',
            value: agi,
            form: '1040',
            lineNumber: '11'
        });

        // Schedule A: Itemized Deductions
        let itemizedDeductions = 0;
        if (input.itemizedDeductions) {
            const schALines = ScheduleA2025({
                ...input.itemizedDeductions,
                adjustedGrossIncome: agi
            }, filingStatus);
            lines.push(...schALines);
            itemizedDeductions = schALines.find((l: any) => l.lineNumber === '17')?.value || 0;
        }

        // Line 12: Standard Deduction or Itemized Deductions (Pick Larger)
        const stdDeduction = this.getStandardDeduction(filingStatus);
        const deductionToUse = Math.max(stdDeduction, itemizedDeductions);

        lines.push({
            id: '1040_12',
            description: itemizedDeductions > stdDeduction ? 'Itemized Deductions (Schedule A)' : 'Standard Deduction',
            value: deductionToUse,
            form: '1040',
            lineNumber: '12'
        });

        // Line 15: Taxable Income
        const taxableIncome = TaxMath.max(0, TaxMath.sub(agi, stdDeduction));
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

        // Line 19: Child Tax Credit
        const ctc = this.calculateCTC(input.dependents || [], agi, filingStatus);
        lines.push({
            id: '1040_19',
            description: 'Child Tax Credit / Credit for Other Dependents',
            value: ctc,
            form: '1040',
            lineNumber: '19'
        });

        // Line 24: Total Tax (Tax - Credits)
        // Simplified: Ensure non-negative
        const totalTax = TaxMath.max(0, TaxMath.sub(tax, ctc));
        lines.push({
            id: '1040_24',
            description: 'Total Tax',
            value: totalTax,
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

        // Line 26: 2025 estimated tax payments and amount applied from 2024 return
        const estimatedPayments = input.taxPayments || 0;
        lines.push({
            id: '1040_26',
            description: '2025 estimated tax payments and amount applied from 2024 return',
            value: estimatedPayments,
            form: '1040',
            lineNumber: '26'
        });

        // Line 33: Total other payments and refundable credits
        // For MVP, just Total Payments = Line 25d + Line 26
        const totalPayments = TaxMath.add(withheld, estimatedPayments);
        lines.push({
            id: '1040_33',
            description: 'Total Payments',
            value: totalPayments,
            form: '1040',
            lineNumber: '33'
        });

        // Line 34: Overpaid
        if (totalPayments > totalTax) {
            lines.push({
                id: '1040_34',
                description: 'Amount Overpaid',
                value: TaxMath.sub(totalPayments, totalTax),
                form: '1040',
                lineNumber: '34'
            });
        }

        // Line 37: Amount You Owe
        if (totalTax > totalPayments) {
            lines.push({
                id: '1040_37',
                description: 'Amount You Owe',
                value: TaxMath.sub(totalTax, totalPayments),
                form: '1040',
                lineNumber: '37'
            });
        }

        return lines;
    }

    private getStandardDeduction(status: FilingStatus): number {
        // 2025 Estimates
        switch (status) {
            case 'SINGLE': return 15000; // Increased illustrative 2025 val
            case 'MARRIED_SEPARATE': return 15000;
            case 'MARRIED_JOINT': return 30000;
            case 'WIDOW': return 30000;
            case 'HEAD_OF_HOUSEHOLD': return 22500;
            default: return 0;
        }
    }

    private calculateTax(income: number, status: FilingStatus): number {
        // Simplified Logic
        return TaxMath.mul(income, 0.15);
    }

    private calculateCTC(dependents: any[], agi: number, status: FilingStatus): number {
        let credit = 0;
        const taxYear = 2025;

        for (const dep of dependents) {
            // Simple age check: < 17 at end of year
            const birthYear = new Date(dep.date_of_birth).getFullYear();
            const age = taxYear - birthYear;

            if (age < 17 && (dep.relationship === 'Child' || dep.relationship === 'Stepchild')) {
                credit += 2000;
            } else {
                credit += 500; // Other Dependent Credit
            }
        }

        // Phase-out
        // $200k Single / $400k Joint
        const threshold = status === 'MARRIED_JOINT' ? 400000 : 200000;
        if (agi > threshold) {
            const excess = agi - threshold;
            // Reduce by $50 for every $1000 over
            const reduction = Math.ceil(excess / 1000) * 50;
            credit = Math.max(0, credit - reduction);
        }

        return credit;
    }
}
