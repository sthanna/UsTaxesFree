import { TaxInput, TaxLine, FilingStatus } from './types';

export interface TaxFormStrategy {
    calculate(input: TaxInput, filingStatus: FilingStatus): TaxLine[];
}
