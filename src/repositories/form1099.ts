import { query } from '../database/connection';

export class Form1099Repository {
    // 1099-INT
    static async createInt(returnId: number, payer: string, amount: number): Promise<any> {
        const result = await query(
            `INSERT INTO form_1099_int (return_id, payer, amount) 
             VALUES ($1, $2, $3) 
             RETURNING id, payer, amount`,
            [returnId, payer, amount]
        );
        return { ...result.rows[0], amount: parseFloat(result.rows[0].amount) };
    }

    static async findIntByReturnId(returnId: number): Promise<{ payer: string, amount: number }[]> {
        const result = await query(
            `SELECT payer, amount FROM form_1099_int WHERE return_id = $1`,
            [returnId]
        );
        return result.rows.map(r => ({ ...r, amount: parseFloat(r.amount) }));
    }

    // 1099-DIV
    static async createDiv(returnId: number, payer: string, amount: number): Promise<any> {
        const result = await query(
            `INSERT INTO form_1099_div (return_id, payer, amount) 
             VALUES ($1, $2, $3) 
             RETURNING id, payer, amount`,
            [returnId, payer, amount]
        );
        return { ...result.rows[0], amount: parseFloat(result.rows[0].amount) };
    }

    static async findDivByReturnId(returnId: number): Promise<{ payer: string, amount: number }[]> {
        const result = await query(
            `SELECT payer, amount FROM form_1099_div WHERE return_id = $1`,
            [returnId]
        );
        return result.rows.map(r => ({ ...r, amount: parseFloat(r.amount) }));
    }
}
