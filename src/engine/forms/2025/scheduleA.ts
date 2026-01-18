import { TaxLine, FilingStatus } from '../../types';
import { TaxMath } from '../../math';

export interface ScheduleAInput {
    medicalExpenses: number;
    stateLocalIncomeTaxes: number;
    realEstateTaxes: number;
    personalPropertyTaxes: number;
    mortgageInterest: number;
    charitableContributionsCash: number;
    charitableContributionsNoncash: number;
    casualtyLosses: number;
    adjustedGrossIncome: number;
}

export const ScheduleA2025 = (input: ScheduleAInput, filingStatus: FilingStatus): TaxLine[] => {
    const lines: TaxLine[] = [];
    const addLine = (id: string, val: number, desc: string) =>
        lines.push({ id: `SchA_${id}`, form: 'Schedule A', lineNumber: id, value: val, description: desc });

    // 1. Medical Expenses
    // Floor is 7.5% of AGI
    const medicalFloor = TaxMath.mul(input.adjustedGrossIncome, 0.075);
    const medicalDeductible = TaxMath.max(0, TaxMath.sub(input.medicalExpenses, medicalFloor));

    addLine('1', input.medicalExpenses, 'Medical and dental expenses');
    addLine('2', input.adjustedGrossIncome, 'Enter AGI');
    addLine('3', medicalFloor, 'Multiply line 2 by 7.5%');
    addLine('4', medicalDeductible, 'Subtract line 3 from line 1');

    // 2. Taxes You Paid (SALT Limit)
    const totalTaxes = TaxMath.add(input.stateLocalIncomeTaxes, input.realEstateTaxes, input.personalPropertyTaxes);
    // SALT Cap: $10,000 normally, $5,000 if MFS
    const saltCap = filingStatus === 'MARRIED_SEPARATE' ? 5000 : 10000;
    const taxesDeductible = TaxMath.min(totalTaxes, saltCap);

    addLine('5', input.stateLocalIncomeTaxes, 'State and local income taxes');
    addLine('6', input.realEstateTaxes, 'Real estate taxes');
    addLine('7', input.personalPropertyTaxes, 'Personal property taxes');
    addLine('5d', totalTaxes, 'Add lines 5 through 7');
    addLine('7', taxesDeductible, 'Total taxes (limited to $10,000)');

    // 3. Interest You Paid
    // Simplified: No tracing of mortgage principal limits for MVP
    const interestDeductible = input.mortgageInterest;
    addLine('8', input.mortgageInterest, 'Home mortgage interest');
    addLine('10', interestDeductible, 'Add lines 8 and 9');

    // 4. Gifts to Charity
    // Simplified: Cash limits (usually 60% AGI) ignored for MVP unless extremely high
    const charityTotal = TaxMath.add(input.charitableContributionsCash, input.charitableContributionsNoncash);
    addLine('11', input.charitableContributionsCash, 'Gifts by cash or check');
    addLine('12', input.charitableContributionsNoncash, 'Other than by cash or check');
    addLine('14', charityTotal, 'Add lines 11 through 13');

    // 5. Casualty and Theft Losses
    // Only for federally declared disasters, simplified
    addLine('15', input.casualtyLosses, 'Casualty and theft losses');

    // Total Itemized Deductions
    const totalItemized = TaxMath.add(
        medicalDeductible,
        taxesDeductible,
        interestDeductible,
        charityTotal,
        input.casualtyLosses
    );

    addLine('17', totalItemized, 'Total itemized deductions');

    return lines;
};
