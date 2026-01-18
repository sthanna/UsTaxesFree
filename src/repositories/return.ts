import { query } from '../database/connection';
import { QueryResult } from 'pg';

export interface TaxReturn {
    id: number;
    user_id: number;
    tax_year: number;
    filing_status: string;
    status: 'DRAFT' | 'FILED' | 'ACCEPTED' | 'REJECTED';
    created_at: Date;
    updated_at: Date;
}

export type CreateReturnDTO = Pick<TaxReturn, 'user_id' | 'tax_year' | 'filing_status'>;

export class ReturnRepository {
    static async create(data: CreateReturnDTO): Promise<TaxReturn> {
        const text = `
      INSERT INTO returns (user_id, tax_year, filing_status, status)
      VALUES ($1, $2, $3, 'DRAFT')
      RETURNING *
    `;
        const values = [data.user_id, data.tax_year, data.filing_status];
        const result: QueryResult<TaxReturn> = await query(text, values);
        return result.rows[0];
    }

    static async findByUserId(userId: number): Promise<TaxReturn[]> {
        const text = `SELECT * FROM returns WHERE user_id = $1 ORDER BY tax_year DESC`;
        const result: QueryResult<TaxReturn> = await query(text, [userId]);
        return result.rows;
    }

    static async findById(id: number): Promise<TaxReturn | null> {
        const text = `SELECT * FROM returns WHERE id = $1`;
        const result: QueryResult<TaxReturn> = await query(text, [id]);
        return result.rows[0] || null;
    }

    static async findByUserIdAndYear(userId: number, year: number): Promise<TaxReturn | null> {
        const text = `SELECT * FROM returns WHERE user_id = $1 AND tax_year = $2`;
        const result: QueryResult<TaxReturn> = await query(text, [userId, year]);
        return result.rows[0] || null;
    }
}
