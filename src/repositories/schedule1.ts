import pool from '../database/connection';

export interface Schedule1AdditionalIncome {
    id?: number;
    return_id: number;
    taxable_refunds_credits?: number;
    alimony_received?: number;
    business_income?: number;
    other_gains_losses?: number;
    rental_income?: number;
    farm_income?: number;
    unemployment_compensation?: number;
    other_income_description?: string;
    other_income_amount?: number;
}

export interface Schedule1Adjustments {
    id?: number;
    return_id: number;
    educator_expenses?: number;
    business_expenses?: number;
    health_savings_account?: number;
    moving_expenses?: number;
    self_employment_sep?: number;
    self_employment_health?: number;
    penalty_early_withdrawal?: number;
    alimony_paid?: number;
    alimony_recipients_ssn?: string;
    ira_deduction?: number;
    student_loan_interest?: number;
    tuition_fees?: number;
    other_adjustments_description?: string;
    other_adjustments_amount?: number;
}

export class Schedule1Repository {
    // ===== Additional Income =====

    static async getAdditionalIncome(returnId: number): Promise<Schedule1AdditionalIncome | null> {
        const client = await pool.connect();
        try {
            const result = await client.query(
                'SELECT * FROM schedule_1_additional_income WHERE return_id = $1',
                [returnId]
            );
            return result.rows.length > 0 ? result.rows[0] : null;
        } finally {
            client.release();
        }
    }

    static async createAdditionalIncome(data: Schedule1AdditionalIncome): Promise<Schedule1AdditionalIncome> {
        const client = await pool.connect();
        try {
            const result = await client.query(
                `INSERT INTO schedule_1_additional_income (
                    return_id, taxable_refunds_credits, alimony_received,
                    business_income, other_gains_losses, rental_income,
                    farm_income, unemployment_compensation,
                    other_income_description, other_income_amount
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *`,
                [
                    data.return_id,
                    data.taxable_refunds_credits || 0,
                    data.alimony_received || 0,
                    data.business_income || 0,
                    data.other_gains_losses || 0,
                    data.rental_income || 0,
                    data.farm_income || 0,
                    data.unemployment_compensation || 0,
                    data.other_income_description || null,
                    data.other_income_amount || 0,
                ]
            );
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    static async updateAdditionalIncome(returnId: number, data: Partial<Schedule1AdditionalIncome>): Promise<Schedule1AdditionalIncome> {
        const client = await pool.connect();
        try {
            const fields: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            Object.entries(data).forEach(([key, value]) => {
                if (key !== 'id' && key !== 'return_id' && value !== undefined) {
                    fields.push(`${key} = $${paramIndex}`);
                    values.push(value);
                    paramIndex++;
                }
            });

            fields.push(`updated_at = NOW()`);
            values.push(returnId);

            const query = `
                UPDATE schedule_1_additional_income
                SET ${fields.join(', ')}
                WHERE return_id = $${paramIndex}
                RETURNING *
            `;

            const result = await client.query(query, values);
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    // ===== Adjustments =====

    static async getAdjustments(returnId: number): Promise<Schedule1Adjustments | null> {
        const client = await pool.connect();
        try {
            const result = await client.query(
                'SELECT * FROM schedule_1_adjustments WHERE return_id = $1',
                [returnId]
            );
            return result.rows.length > 0 ? result.rows[0] : null;
        } finally {
            client.release();
        }
    }

    static async createAdjustments(data: Schedule1Adjustments): Promise<Schedule1Adjustments> {
        const client = await pool.connect();
        try {
            const result = await client.query(
                `INSERT INTO schedule_1_adjustments (
                    return_id, educator_expenses, business_expenses,
                    health_savings_account, moving_expenses,
                    self_employment_sep, self_employment_health,
                    penalty_early_withdrawal, alimony_paid, alimony_recipients_ssn,
                    ira_deduction, student_loan_interest, tuition_fees,
                    other_adjustments_description, other_adjustments_amount
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                RETURNING *`,
                [
                    data.return_id,
                    data.educator_expenses || 0,
                    data.business_expenses || 0,
                    data.health_savings_account || 0,
                    data.moving_expenses || 0,
                    data.self_employment_sep || 0,
                    data.self_employment_health || 0,
                    data.penalty_early_withdrawal || 0,
                    data.alimony_paid || 0,
                    data.alimony_recipients_ssn || null,
                    data.ira_deduction || 0,
                    data.student_loan_interest || 0,
                    data.tuition_fees || 0,
                    data.other_adjustments_description || null,
                    data.other_adjustments_amount || 0,
                ]
            );
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    static async updateAdjustments(returnId: number, data: Partial<Schedule1Adjustments>): Promise<Schedule1Adjustments> {
        const client = await pool.connect();
        try {
            const fields: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            Object.entries(data).forEach(([key, value]) => {
                if (key !== 'id' && key !== 'return_id' && value !== undefined) {
                    fields.push(`${key} = $${paramIndex}`);
                    values.push(value);
                    paramIndex++;
                }
            });

            fields.push(`updated_at = NOW()`);
            values.push(returnId);

            const query = `
                UPDATE schedule_1_adjustments
                SET ${fields.join(', ')}
                WHERE return_id = $${paramIndex}
                RETURNING *
            `;

            const result = await client.query(query, values);
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    static async deleteByReturnId(returnId: number): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('DELETE FROM schedule_1_additional_income WHERE return_id = $1', [returnId]);
            await client.query('DELETE FROM schedule_1_adjustments WHERE return_id = $1', [returnId]);
        } finally {
            client.release();
        }
    }
}
