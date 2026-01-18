import pool from '../database/connection';

export interface Dependent {
    id?: number;
    return_id: number;
    first_name: string;
    last_name: string;
    ssn: string;
    date_of_birth: Date | string;
    relationship: string;
    months_lived_with: number;
    is_us_citizen?: boolean;
    is_student?: boolean;
    is_disabled?: boolean;
    qualifies_for_child_tax_credit?: boolean;
    qualifies_for_other_dependent_credit?: boolean;
    qualifies_for_eitc?: boolean;
    care_expenses?: number;
    care_provider_name?: string;
    care_provider_tin?: string;
}

export class DependentsRepository {
    static async findByReturnId(returnId: number): Promise<Dependent[]> {
        const client = await pool.connect();
        try {
            const result = await client.query(
                'SELECT * FROM dependents WHERE return_id = $1 ORDER BY date_of_birth',
                [returnId]
            );
            return result.rows;
        } finally {
            client.release();
        }
    }

    static async findById(id: number): Promise<Dependent | null> {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM dependents WHERE id = $1', [id]);
            return result.rows.length > 0 ? result.rows[0] : null;
        } finally {
            client.release();
        }
    }

    static async create(data: Dependent): Promise<Dependent> {
        const client = await pool.connect();
        try {
            const result = await client.query(
                `INSERT INTO dependents (
                    return_id, first_name, last_name, ssn, date_of_birth,
                    relationship, months_lived_with, is_us_citizen, is_student,
                    is_disabled, qualifies_for_child_tax_credit,
                    qualifies_for_other_dependent_credit, qualifies_for_eitc,
                    care_expenses, care_provider_name, care_provider_tin
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                RETURNING *`,
                [
                    data.return_id,
                    data.first_name,
                    data.last_name,
                    data.ssn,
                    data.date_of_birth,
                    data.relationship,
                    data.months_lived_with,
                    data.is_us_citizen ?? true,
                    data.is_student ?? false,
                    data.is_disabled ?? false,
                    data.qualifies_for_child_tax_credit ?? false,
                    data.qualifies_for_other_dependent_credit ?? false,
                    data.qualifies_for_eitc ?? false,
                    data.care_expenses ?? 0,
                    data.care_provider_name || null,
                    data.care_provider_tin || null,
                ]
            );
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    static async update(id: number, data: Partial<Dependent>): Promise<Dependent> {
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

            if (fields.length === 0) {
                throw new Error('No fields to update');
            }

            fields.push(`updated_at = NOW()`);
            values.push(id);

            const query = `
                UPDATE dependents
                SET ${fields.join(', ')}
                WHERE id = $${paramIndex}
                RETURNING *
            `;

            const result = await client.query(query, values);
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    static async delete(id: number): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('DELETE FROM dependents WHERE id = $1', [id]);
        } finally {
            client.release();
        }
    }

    static async countQualifyingChildren(returnId: number): Promise<number> {
        const client = await pool.connect();
        try {
            const result = await client.query(
                'SELECT COUNT(*) FROM dependents WHERE return_id = $1 AND qualifies_for_child_tax_credit = true',
                [returnId]
            );
            return parseInt(result.rows[0].count);
        } finally {
            client.release();
        }
    }
}
