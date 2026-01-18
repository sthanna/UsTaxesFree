import pool from '../database/connection';

export interface TaxPayment {
    id?: number;
    return_id: number;
    payment_type: string; // 'estimated_q1', 'estimated_q2', 'withholding', 'other'
    payment_date: Date | string;
    amount: number;
    description?: string;
    confirmation_number?: string;
}

export class TaxPaymentsRepository {
    static async findByReturnId(returnId: number): Promise<TaxPayment[]> {
        const client = await pool.connect();
        try {
            const result = await client.query(
                'SELECT * FROM tax_payments WHERE return_id = $1 ORDER BY payment_date',
                [returnId]
            );
            return result.rows;
        } finally {
            client.release();
        }
    }

    static async create(data: TaxPayment): Promise<TaxPayment> {
        const client = await pool.connect();
        try {
            const result = await client.query(
                `INSERT INTO tax_payments (
                    return_id, payment_type, payment_date, amount, description, confirmation_number
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [
                    data.return_id,
                    data.payment_type,
                    data.payment_date,
                    data.amount,
                    data.description || null,
                    data.confirmation_number || null
                ]
            );
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    static async delete(id: number): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('DELETE FROM tax_payments WHERE id = $1', [id]);
        } finally {
            client.release();
        }
    }
}
