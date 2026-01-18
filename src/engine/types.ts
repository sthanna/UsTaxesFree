import { Dependent } from '../repositories/dependents';

export type FilingStatus = 'SINGLE' | 'MARRIED_JOINT' | 'MARRIED_SEPARATE' | 'HEAD_OF_HOUSEHOLD' | 'WIDOW';

export interface TaxInput {
    w2s: W2Form[];
    taxableInterest: number; // 1099-INT Box 1
    ordinaryDividends: number; // 1099-DIV Box 1a
    capitalGainsTransactions: StockTransaction[];
    // Schedule 1
    additionalIncome: number; // Part I Total
    adjustments: number; // Part II Total
    // Dependents
    dependents: Dependent[];
    taxPayments: number; // For Line 26 (Estimated payments, etc)
    itemizedDeductions?: {
        medicalExpenses: number;
        stateLocalIncomeTaxes: number;
        realEstateTaxes: number;
        personalPropertyTaxes: number;
        mortgageInterest: number;
        charitableContributionsCash: number;
        charitableContributionsNoncash: number;
        casualtyLosses: number;
    };
    residentState?: string; // 'NY', 'PA', 'NJ', etc.
}

export interface StockTransaction {
    description: string;
    proceeds: number;
    costBasis: number;
    isLongTerm: boolean;
}

export interface W2Form {
    id: string;
    employer: string;
    wages: number; // Box 1
    federalTaxWithheld: number; // Box 2
}

export interface TaxLine {
    id: string;
    description: string;
    value: number;
    form: string; // e.g., '1040', 'Sch 1'
    lineNumber: string; // e.g., '1z', '15'
}

export interface CalculationResult {
    taxYear: number;
    filingStatus: FilingStatus;
    lines: TaxLine[];
    refund: number;
    amountOwed: number;
    stateResult?: StateTaxResult;
    errors: string[];
}

export interface StateTaxResult {
    state: string; // 'NY', 'CA'
    lines: TaxLine[];
    amountOwed?: number;
    refund?: number;
    totalTax?: number;
}
