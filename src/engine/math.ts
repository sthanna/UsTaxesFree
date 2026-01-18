/**
 * Tax calculations require precision. Floating point math (0.1 + 0.2) is dangerous.
 * We will use a simple integer-based approach (cents) for MVP, or a library if it gets complex.
 * For now, standard rounding to 2 decimal places after every operation is a safe-enough baseline for MVP,
 * but specifically enforcing rounding is key.
 */

export class TaxMath {
    static round(num: number): number {
        return Math.round(num * 100) / 100;
    }

    static add(...nums: number[]): number {
        const sum = nums.reduce((acc, curr) => acc + curr, 0);
        return this.round(sum);
    }

    static sub(a: number, b: number): number {
        return this.round(a - b);
    }

    static mul(a: number, b: number): number {
        return this.round(a * b);
    }

    static max(a: number, b: number): number {
        return Math.max(a, b);
    }

    static min(a: number, b: number): number {
        return Math.min(a, b);
    }
}
