import { query } from '../database/connection';

export class Form1099BRepository {
    static async create(returnId: number, form: { description: string, proceeds: number, costBasis: number, isLongTerm: boolean }): Promise<any> {
        const result = await query(
            `INSERT INTO form_1099_b (return_id, description, proceeds, cost_basis, is_long_term) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id, description, proceeds, cost_basis, is_long_term`,
            [returnId, form.description, form.proceeds, form.costBasis, form.isLongTerm]
        );
        return {
            ...result.rows[0],
            proceeds: parseFloat(result.rows[0].proceeds),
            costBasis: parseFloat(result.rows[0].cost_basis),
            isLongTerm: result.rows[0].is_long_term
        };
    }

    static async findByReturnId(returnId: number): Promise<any[]> {
        const result = await query(
            `SELECT id, description, proceeds, cost_basis, is_long_term 
             FROM form_1099_b WHERE return_id = $1`,
            [returnId]
        );
        return result.rows.map(r => ({
            ...r,
            proceeds: parseFloat(r.proceeds),
            costBasis: parseFloat(r.cost_basis),
            isLongTerm: r.is_long_term
        }));
    }
}
