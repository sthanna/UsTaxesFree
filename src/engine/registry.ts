import { TaxFormStrategy } from './strategy';
import { Form1040_2025 } from './forms/2025/f1040';
import { Form1040_2024 } from './forms/2024/f1040';

export class TaxYearRegistry {
    private static strategies: Record<number, TaxFormStrategy> = {
        2025: new Form1040_2025(),
        2024: new Form1040_2024()
    };

    static getStrategy(year: number): TaxFormStrategy {
        const strategy = this.strategies[year];
        if (!strategy) {
            throw new Error(`Tax year ${year} not supported`);
        }
        return strategy;
    }
}
