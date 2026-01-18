import { TaxInput, TaxLine, FilingStatus, StateTaxResult } from '../types';

export interface StateTaxStrategy {
    calculate(federalLines: TaxLine[], input: TaxInput, filingStatus: FilingStatus): StateTaxResult;
}

export { StateTaxResult };
