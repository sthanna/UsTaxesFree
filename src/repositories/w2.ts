import { query } from '../database/connection';
import { W2Form } from '../engine/types';

export class W2Repository {
    static async create(returnId: number, form: Omit<W2Form, 'id'>): Promise<W2Form> {
        const result = await query(
            `INSERT INTO w2_forms (return_id, employer, wages, fed_withholding) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, employer, wages, fed_withholding as "federalTaxWithheld"`,
            [returnId, form.employer, form.wages, form.federalTaxWithheld]
        );
        return {
            ...result.rows[0],
            wages: parseFloat(result.rows[0].wages),
            federalTaxWithheld: parseFloat(result.rows[0].federalTaxWithheld)
        };
    }

    static async findByReturnId(returnId: number): Promise<W2Form[]> {
        const result = await query(
            `SELECT id, employer, wages, fed_withholding as "federalTaxWithheld"
             FROM w2_forms 
             WHERE return_id = $1`,
            [returnId]
        );
        return result.rows.map(row => ({
            ...row,
            wages: parseFloat(row.wages),
            federalTaxWithheld: parseFloat(row.federalTaxWithheld)
        }));
    }
}
