import { TaxRulesRepository } from '../repositories/tax-rules';
import crypto from 'crypto';

export interface TaxRules {
    version: string;
    taxYear: number;
    jurisdiction: string;
    standardDeduction: {
        single: number;
        married_filing_jointly: number;
        married_filing_separately: number;
        head_of_household: number;
        qualifying_widow_widower: number;
    };
    taxBrackets: {
        single: TaxBracket[];
        married_filing_jointly: TaxBracket[];
        married_filing_separately: TaxBracket[];
        head_of_household: TaxBracket[];
    };
    longTermCapitalGainsRates: {
        single: TaxBracket[];
        married_filing_jointly: TaxBracket[];
    };
    childTaxCredit: {
        creditPerChild: number;
        refundablePortionMax: number;
        phaseOutRate: number;
        phaseOutStartSingle: number;
        phaseOutStartMarriedFilingJointly: number;
    };
    earnedIncomeTaxCredit?: any;
    additionalMedicareTax?: any;
    netInvestmentIncomeTax?: any;
}

export interface TaxBracket {
    rate: number;
    floor: number;
    ceiling: number | null;
}

export class TaxRulesService {
    private static rulesCache: Map<string, TaxRules> = new Map();

    /**
     * Get tax rules for a specific year and jurisdiction
     * Uses caching for performance
     */
    static async getRules(taxYear: number, jurisdiction: string = 'US_FEDERAL'): Promise<TaxRules> {
        const cacheKey = `${taxYear}_${jurisdiction}`;

        // Check cache
        if (this.rulesCache.has(cacheKey)) {
            return this.rulesCache.get(cacheKey)!;
        }

        // Fetch from database
        const rulesVersion = await TaxRulesRepository.getActiveRules(taxYear, jurisdiction);

        if (!rulesVersion) {
            throw new Error(`No active tax rules found for year=${taxYear}, jurisdiction=${jurisdiction}`);
        }

        const rules: TaxRules = {
            version: rulesVersion.version,
            taxYear: rulesVersion.tax_year,
            jurisdiction: rulesVersion.jurisdiction,
            ...rulesVersion.rule_content,
        };

        // Cache it
        this.rulesCache.set(cacheKey, rules);

        return rules;
    }

    /**
     * Clear cache (called when rules are updated)
     */
    static clearCache(): void {
        this.rulesCache.clear();
    }

    /**
     * Create a new rules version from JSON
     */
    static async createRulesFromJson(
        version: string,
        taxYear: number,
        jurisdiction: string,
        rulesJson: any
    ): Promise<void> {
        const ruleHash = this.generateRuleHash(rulesJson);

        await TaxRulesRepository.createRulesVersion({
            version,
            taxYear,
            jurisdiction,
            ruleContent: rulesJson,
            ruleHash,
        });
    }

    /**
     * Generate hash for rule integrity
     */
    private static generateRuleHash(rules: any): string {
        const data = JSON.stringify(rules);
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * Bootstrap default 2025 rules
     */
    static async bootstrap2025Rules(): Promise<void> {
        const existingRules = await TaxRulesRepository.getActiveRules(2025, 'US_FEDERAL');
        if (existingRules) {
            console.log('2025 rules already exist, skipping bootstrap');
            return;
        }

        const rules2025 = {
            standardDeduction: {
                single: 14600,
                married_filing_jointly: 29200,
                married_filing_separately: 14600,
                head_of_household: 21900,
                qualifying_widow_widower: 29200,
            },
            taxBrackets: {
                single: [
                    { rate: 0.10, floor: 0, ceiling: 11600 },
                    { rate: 0.12, floor: 11600, ceiling: 47150 },
                    { rate: 0.22, floor: 47150, ceiling: 100525 },
                    { rate: 0.24, floor: 100525, ceiling: 191950 },
                    { rate: 0.32, floor: 191950, ceiling: 243725 },
                    { rate: 0.35, floor: 243725, ceiling: 609350 },
                    { rate: 0.37, floor: 609350, ceiling: null },
                ],
                married_filing_jointly: [
                    { rate: 0.10, floor: 0, ceiling: 23200 },
                    { rate: 0.12, floor: 23200, ceiling: 94300 },
                    { rate: 0.22, floor: 94300, ceiling: 201050 },
                    { rate: 0.24, floor: 201050, ceiling: 383900 },
                    { rate: 0.32, floor: 383900, ceiling: 487450 },
                    { rate: 0.35, floor: 487450, ceiling: 731200 },
                    { rate: 0.37, floor: 731200, ceiling: null },
                ],
                married_filing_separately: [
                    { rate: 0.10, floor: 0, ceiling: 11600 },
                    { rate: 0.12, floor: 11600, ceiling: 47150 },
                    { rate: 0.22, floor: 47150, ceiling: 100525 },
                    { rate: 0.24, floor: 100525, ceiling: 191950 },
                    { rate: 0.32, floor: 191950, ceiling: 243725 },
                    { rate: 0.35, floor: 243725, ceiling: 365600 },
                    { rate: 0.37, floor: 365600, ceiling: null },
                ],
                head_of_household: [
                    { rate: 0.10, floor: 0, ceiling: 16550 },
                    { rate: 0.12, floor: 16550, ceiling: 63100 },
                    { rate: 0.22, floor: 63100, ceiling: 100500 },
                    { rate: 0.24, floor: 100500, ceiling: 191950 },
                    { rate: 0.32, floor: 191950, ceiling: 243700 },
                    { rate: 0.35, floor: 243700, ceiling: 609350 },
                    { rate: 0.37, floor: 609350, ceiling: null },
                ],
            },
            longTermCapitalGainsRates: {
                single: [
                    { rate: 0.00, floor: 0, ceiling: 47025 },
                    { rate: 0.15, floor: 47025, ceiling: 518900 },
                    { rate: 0.20, floor: 518900, ceiling: null },
                ],
                married_filing_jointly: [
                    { rate: 0.00, floor: 0, ceiling: 94050 },
                    { rate: 0.15, floor: 94050, ceiling: 583750 },
                    { rate: 0.20, floor: 583750, ceiling: null },
                ],
            },
            childTaxCredit: {
                creditPerChild: 2000,
                refundablePortionMax: 1600,
                phaseOutRate: 0.05,
                phaseOutStartSingle: 200000,
                phaseOutStartMarriedFilingJointly: 400000,
            },
            earnedIncomeTaxCredit: {
                single_no_children: {
                    maximumCredit: 600,
                    maximumEarnedIncome: 17340,
                    phaseOutRate: 0.0765,
                    phaseOutStart: 17340,
                },
                single_one_child: {
                    maximumCredit: 3733,
                    maximumEarnedIncome: 22610,
                    phaseOutRate: 0.3438,
                    phaseOutStart: 22610,
                },
                single_two_children: {
                    maximumCredit: 6120,
                    maximumEarnedIncome: 28380,
                    phaseOutRate: 0.4012,
                    phaseOutStart: 28380,
                },
            },
            additionalMedicareTax: {
                employeeRate: 0.009,
                wageThresholdSingle: 200000,
                wageThresholdMarriedFilingJointly: 250000,
            },
            netInvestmentIncomeTax: {
                rate: 0.038,
                thresholdSingle: 200000,
                thresholdMarriedFilingJointly: 250000,
            },
        };

        await this.createRulesFromJson('2025.1.0', 2025, 'US_FEDERAL', rules2025);
        await TaxRulesRepository.activateRulesVersion('2025.1.0');

        console.log('2025 tax rules bootstrapped successfully');
    }
}
