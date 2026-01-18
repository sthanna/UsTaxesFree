import { query } from '../database/connection';

export interface ScheduleAData {
    medical_expenses?: number;
    state_local_income_taxes?: number;
    real_estate_taxes?: number;
    personal_property_taxes?: number;
    mortgage_interest?: number;
    charitable_contributions_cash?: number;
    charitable_contributions_noncash?: number;
    casualty_losses?: number;
}

export class ScheduleARepository {
    static async findByReturnId(returnId: number): Promise<ScheduleAData | null> {
        const res = await query(
            'SELECT * FROM schedule_a WHERE return_id = $1',
            [returnId]
        );
        return res.rows[0] || null;
    }

    static async upsert(returnId: number, data: ScheduleAData): Promise<void> {
        const {
            medical_expenses = 0,
            state_local_income_taxes = 0,
            real_estate_taxes = 0,
            personal_property_taxes = 0,
            mortgage_interest = 0,
            charitable_contributions_cash = 0,
            charitable_contributions_noncash = 0,
            casualty_losses = 0
        } = data;

        const exists = await this.findByReturnId(returnId);

        if (exists) {
            await query(
                `UPDATE schedule_a SET 
                medical_expenses = $1, state_local_income_taxes = $2, real_estate_taxes = $3, 
                personal_property_taxes = $4, mortgage_interest = $5, charitable_contributions_cash = $6, 
                charitable_contributions_noncash = $7, casualty_losses = $8, updated_at = NOW() 
                WHERE return_id = $9`,
                [
                    medical_expenses, state_local_income_taxes, real_estate_taxes,
                    personal_property_taxes, mortgage_interest, charitable_contributions_cash,
                    charitable_contributions_noncash, casualty_losses, returnId
                ]
            );
        } else {
            await query(
                `INSERT INTO schedule_a (
                    return_id, medical_expenses, state_local_income_taxes, real_estate_taxes, 
                    personal_property_taxes, mortgage_interest, charitable_contributions_cash, 
                    charitable_contributions_noncash, casualty_losses
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                    returnId, medical_expenses, state_local_income_taxes, real_estate_taxes,
                    personal_property_taxes, mortgage_interest, charitable_contributions_cash,
                    charitable_contributions_noncash, casualty_losses
                ]
            );
        }
    }
}
