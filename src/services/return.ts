import { ReturnRepository, TaxReturn, CreateReturnDTO } from '../repositories/return';

export class ReturnService {
    static async createReturn(userId: number, taxYear: number, filingStatus: string): Promise<TaxReturn> {
        // Check if return already exists for this year
        const existing = await ReturnRepository.findByUserIdAndYear(userId, taxYear);
        if (existing) {
            throw new Error(`Return for tax year ${taxYear} already exists.`);
        }

        return ReturnRepository.create({
            user_id: userId,
            tax_year: taxYear,
            filing_status: filingStatus,
        });
    }

    static async getUserReturns(userId: number): Promise<TaxReturn[]> {
        return ReturnRepository.findByUserId(userId);
    }

    static async getReturnById(userId: number, returnId: number): Promise<TaxReturn> {
        const taxReturn = await ReturnRepository.findById(returnId);
        if (!taxReturn) {
            throw new Error('Return not found');
        }
        if (taxReturn.user_id !== userId) {
            throw new Error('Unauthorized access to return');
        }
        return taxReturn;
    }
}
